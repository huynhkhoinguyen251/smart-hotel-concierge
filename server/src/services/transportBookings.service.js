import { MAX_ADVANCE_DAYS } from '../config/booking.js';
import { withTransaction } from '../config/db.js';
import { USER_CANCELLABLE_SERVICE_STATUS } from '../config/services.js';
import {
  HOURS_PER_RENTAL_DAY,
  MAX_RENTAL_DAYS,
  TRANSPORT_CATEGORIES,
  TRANSPORT_QUANTITY_LIMITS,
} from '../config/tourism.js';
import * as servicesModel from '../models/services.model.js';
import * as transportBookingsModel from '../models/transportBookings.model.js';
import AppError from '../utils/AppError.js';
import { addDays, formatLocalDate, parseLocalDateTime } from '../utils/date.js';
import { multiplyPrice } from '../utils/money.js';
import { getPagination } from '../utils/pagination.js';
import { SERVICE_NOT_FOUND } from './services.service.js';

export const TRANSPORT_BOOKING_NOT_FOUND = 'Transport booking not found';
const TRANSPORT_BOOKING_FORBIDDEN = 'You do not have permission to access this transport booking';
const END_AT_NOT_ALLOWED = 'end_at is only used for motorbike rentals';

const MS_PER_RENTAL_DAY = HOURS_PER_RENTAL_DAY * 60 * 60 * 1000;

// Dữ liệu trả về của một đơn vận chuyển. Đơn trong API admin có thêm user.
// vehicle_plate là null cho đến khi admin nhập lúc duyệt.
export const toTransportBookingResponse = (transportBooking, { withUser = false } = {}) => ({
  id: transportBooking.id,
  status: transportBooking.status,
  start_at: transportBooking.start_at,
  end_at: transportBooking.end_at,
  pickup_location: transportBooking.pickup_location,
  dropoff_location: transportBooking.dropoff_location,
  flight_number: transportBooking.flight_number,
  vehicle_plate: transportBooking.vehicle_plate,
  quantity: transportBooking.quantity,
  unit_price: transportBooking.unit_price,
  total_price: transportBooking.total_price,
  note: transportBooking.note,
  created_at: transportBooking.created_at,
  service: transportBooking.service,
  can_cancel: transportBooking.status === USER_CANCELLABLE_SERVICE_STATUS,
  ...(withUser && { user: transportBooking.user }),
});

export const findTransportBookingOr404 = async (id, conn) => {
  const transportBooking = await transportBookingsModel.findTransportBookingById(id, conn);
  if (!transportBooking) {
    throw new AppError(404, TRANSPORT_BOOKING_NOT_FOUND);
  }
  return transportBooking;
};

// start_at phải ở tương lai và không quá MAX_ADVANCE_DAYS ngày, theo giờ địa phương của server.
const ensureValidStart = (startAt, now = new Date()) => {
  if (parseLocalDateTime(startAt) <= now) {
    throw new AppError(400, 'Start time (start_at) must be in the future');
  }
  // Chuỗi YYYY-MM-DD so sánh được trực tiếp theo thứ tự ngày.
  if (startAt.slice(0, 10) > addDays(formatLocalDate(now), MAX_ADVANCE_DAYS)) {
    throw new AppError(
      400,
      `Start time (start_at) cannot be more than ${MAX_ADVANCE_DAYS} days from today`,
    );
  }
};

const ensureQuantityInRange = (category, quantity, message) => {
  const { min, max } = TRANSPORT_QUANTITY_LIMITS[category];
  if (quantity < min || quantity > max) {
    throw new AppError(400, message);
  }
};

// Thuê xe máy: luôn 1 xe, phải có end_at. Mỗi 24 giờ bắt đầu tính là 1 ngày, từ 1 đến 30 ngày.
const priceMotorbikeRental = ({ start_at, end_at, quantity }, price) => {
  if (quantity !== undefined) {
    ensureQuantityInRange(
      'motorbike_rental',
      quantity,
      'Each motorbike rental is for one motorbike',
    );
  }
  if (end_at === undefined) {
    throw new AppError(400, 'End time (end_at) is required for a motorbike rental');
  }

  const durationMs = parseLocalDateTime(end_at) - parseLocalDateTime(start_at);
  if (durationMs <= 0) {
    throw new AppError(400, 'End time (end_at) must be after the start time (start_at)');
  }
  const rentalDays = Math.ceil(durationMs / MS_PER_RENTAL_DAY);
  if (rentalDays > MAX_RENTAL_DAYS) {
    throw new AppError(400, `A motorbike rental can be at most ${MAX_RENTAL_DAYS} days`);
  }

  return {
    quantity: 1,
    end_at: `${end_at}:00`,
    flight_number: null,
    total_price: multiplyPrice(price, rentalDays),
  };
};

// Đón sân bay: quantity là số xe (1-5), bắt buộc có số hiệu chuyến bay, không có end_at.
const priceAirportPickup = ({ end_at, quantity = 1, flight_number }, price) => {
  if (end_at !== undefined) {
    throw new AppError(400, END_AT_NOT_ALLOWED);
  }
  const { min, max } = TRANSPORT_QUANTITY_LIMITS.airport_pickup;
  ensureQuantityInRange(
    'airport_pickup',
    quantity,
    `Quantity for an airport pickup is the number of cars, from ${min} to ${max}`,
  );
  if (!flight_number) {
    throw new AppError(400, 'Flight number (flight_number) is required for an airport pickup');
  }

  return { quantity, end_at: null, flight_number, total_price: multiplyPrice(price, quantity) };
};

// Xe đưa đón: quantity là số người (1-20), không có end_at, không lưu số hiệu chuyến bay.
const priceShuttle = ({ end_at, quantity = 1 }, price) => {
  if (end_at !== undefined) {
    throw new AppError(400, END_AT_NOT_ALLOWED);
  }
  const { min, max } = TRANSPORT_QUANTITY_LIMITS.shuttle;
  ensureQuantityInRange(
    'shuttle',
    quantity,
    `Quantity for a shuttle is the number of people, from ${min} to ${max}`,
  );

  return {
    quantity,
    end_at: null,
    flight_number: null,
    total_price: multiplyPrice(price, quantity),
  };
};

const PRICE_BY_CATEGORY = {
  motorbike_rental: priceMotorbikeRental,
  airport_pickup: priceAirportPickup,
  shuttle: priceShuttle,
};

export const createTransportBooking = async (userId, data) => {
  const id = await withTransaction(async (conn) => {
    const service = await servicesModel.findServiceById(data.service_id, conn);
    if (!service || !service.is_active) {
      throw new AppError(404, SERVICE_NOT_FOUND);
    }
    if (!TRANSPORT_CATEGORIES.includes(service.category)) {
      throw new AppError(400, 'This service is booked through the hotel service API');
    }

    ensureValidStart(data.start_at);

    // Giá lấy từ database. vehicle_plate không bao giờ lấy từ user; admin nhập khi duyệt.
    const priced = PRICE_BY_CATEGORY[service.category](data, service.price);

    return transportBookingsModel.createTransportBooking(
      {
        user_id: userId,
        service_id: service.id,
        start_at: `${data.start_at}:00`,
        end_at: priced.end_at,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
        flight_number: priced.flight_number,
        quantity: priced.quantity,
        unit_price: service.price,
        total_price: priced.total_price,
        note: data.note ?? null,
      },
      conn,
    );
  });

  return toTransportBookingResponse(await findTransportBookingOr404(id));
};

export const listMyTransportBookings = async (userId, { page, limit, status }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, status };

  const [transportBookings, total] = await Promise.all([
    transportBookingsModel.findTransportBookings({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    transportBookingsModel.countTransportBookings(filters),
  ]);

  return {
    transportBookings: transportBookings.map((item) => toTransportBookingResponse(item)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyTransportBooking = async (userId, id) => {
  const transportBooking = await findTransportBookingOr404(id);
  if (transportBooking.user.id !== userId) {
    throw new AppError(403, TRANSPORT_BOOKING_FORBIDDEN);
  }
  return toTransportBookingResponse(transportBooking);
};

// User chỉ tự hủy được đơn còn pending.
export const cancelMyTransportBooking = async (userId, id) => {
  await withTransaction(async (conn) => {
    const transportBooking = await transportBookingsModel.lockTransportBookingById(id, conn);
    if (!transportBooking) {
      throw new AppError(404, TRANSPORT_BOOKING_NOT_FOUND);
    }
    if (transportBooking.user_id !== userId) {
      throw new AppError(403, TRANSPORT_BOOKING_FORBIDDEN);
    }
    if (transportBooking.status !== USER_CANCELLABLE_SERVICE_STATUS) {
      throw new AppError(400, 'Only pending transport bookings can be cancelled');
    }

    await transportBookingsModel.updateTransportBookingStatus(
      transportBooking.id,
      { status: 'cancelled' },
      conn,
    );
  });

  return toTransportBookingResponse(await findTransportBookingOr404(id));
};
