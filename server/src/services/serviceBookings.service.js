import { CHECK_IN_HOUR } from '../config/booking.js';
import { withTransaction } from '../config/db.js';
import {
  HOTEL_SERVICE_BOOKING_STATUSES,
  MIN_SERVICE_QUANTITY,
  STAY_END_HOUR,
  STAY_END_MINUTE,
  USER_CANCELLABLE_SERVICE_STATUS,
} from '../config/services.js';
import * as bookingsModel from '../models/bookings.model.js';
import * as serviceBookingsModel from '../models/serviceBookings.model.js';
import * as servicesModel from '../models/services.model.js';
import AppError from '../utils/AppError.js';
import { parseLocalDateTime, toLocalDateTime } from '../utils/date.js';
import { getPagination } from '../utils/pagination.js';
import { BOOKING_NOT_FOUND } from './bookings.service.js';
import { SERVICE_NOT_FOUND } from './services.service.js';

export const SERVICE_REQUEST_NOT_FOUND = 'Service request not found';
const SERVICE_REQUEST_FORBIDDEN = 'You do not have permission to access this service request';

const pad = (number) => String(number).padStart(2, '0');

// Làm tròn 2 chữ số để tránh sai số khi nhân số thập phân trong JavaScript.
const calculateTotal = (quantity, unitPrice) => Math.round(quantity * unitPrice * 100) / 100;

// Dữ liệu trả về của một yêu cầu. Yêu cầu trong API admin có thêm user.
export const toServiceBookingResponse = (serviceBooking, { withUser = false } = {}) => ({
  id: serviceBooking.id,
  status: serviceBooking.status,
  scheduled_at: serviceBooking.scheduled_at,
  quantity: serviceBooking.quantity,
  unit_price: serviceBooking.unit_price,
  total_price: serviceBooking.total_price,
  note: serviceBooking.note,
  created_at: serviceBooking.created_at,
  service: serviceBooking.service,
  booking: serviceBooking.booking,
  can_cancel: serviceBooking.status === USER_CANCELLABLE_SERVICE_STATUS,
  ...(withUser && { user: serviceBooking.user }),
});

export const findServiceBookingOr404 = async (id, conn) => {
  const serviceBooking = await serviceBookingsModel.findServiceBookingById(id, conn);
  if (!serviceBooking) {
    throw new AppError(404, SERVICE_REQUEST_NOT_FOUND);
  }
  return serviceBooking;
};

// scheduled_at phải ở tương lai và nằm trong thời gian lưu trú:
// từ 14:00 ngày check-in đến 23:59 ngày check-out, theo giờ địa phương của server.
const ensureWithinStay = (scheduledAt, booking, now = new Date()) => {
  const scheduled = parseLocalDateTime(scheduledAt);
  if (scheduled <= now) {
    throw new AppError(400, 'Scheduled time (scheduled_at) must be in the future');
  }

  const stayStart = toLocalDateTime(booking.check_in, CHECK_IN_HOUR);
  const stayEnd = toLocalDateTime(booking.check_out, STAY_END_HOUR, STAY_END_MINUTE);
  if (scheduled < stayStart || scheduled > stayEnd) {
    throw new AppError(
      400,
      `Scheduled time (scheduled_at) must be within your stay, from ${booking.check_in} ${pad(CHECK_IN_HOUR)}:00 to ${booking.check_out} ${pad(STAY_END_HOUR)}:${pad(STAY_END_MINUTE)}`,
    );
  }
};

export const createServiceBooking = async (
  userId,
  { booking_id, service_id, scheduled_at, quantity = MIN_SERVICE_QUANTITY, note = null },
) => {
  const id = await withTransaction(async (conn) => {
    // Khóa đơn đặt phòng, để đơn không bị hủy hoặc đổi trạng thái trong lúc tạo yêu cầu.
    const booking = await bookingsModel.lockBookingById(booking_id, conn);
    if (!booking) {
      throw new AppError(404, BOOKING_NOT_FOUND);
    }
    if (booking.user_id !== userId) {
      throw new AppError(403, 'You do not have permission to access this booking');
    }

    const service = await servicesModel.findServiceById(service_id, conn);
    if (!service || !service.is_active) {
      throw new AppError(404, SERVICE_NOT_FOUND);
    }

    const requiredStatuses = HOTEL_SERVICE_BOOKING_STATUSES[service.category];
    if (!requiredStatuses) {
      throw new AppError(400, 'This service is booked through the tourism API');
    }
    if (!requiredStatuses.includes(booking.status)) {
      throw new AppError(
        400,
        `The ${service.category} service requires a booking with status ${requiredStatuses.join(' or ')}; this booking is ${booking.status}`,
      );
    }

    ensureWithinStay(scheduled_at, booking);

    // Giá lấy từ database, không tin giá do frontend gửi lên.
    return serviceBookingsModel.createServiceBooking(
      {
        booking_id: booking.id,
        service_id: service.id,
        scheduled_at: `${scheduled_at}:00`,
        quantity,
        unit_price: service.price,
        total_price: calculateTotal(quantity, service.price),
        note,
      },
      conn,
    );
  });

  return toServiceBookingResponse(await findServiceBookingOr404(id));
};

export const listMyServiceBookings = async (userId, { page, limit, status }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, status };

  const [serviceBookings, total] = await Promise.all([
    serviceBookingsModel.findServiceBookings({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    serviceBookingsModel.countServiceBookings(filters),
  ]);

  return {
    serviceBookings: serviceBookings.map((item) => toServiceBookingResponse(item)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyServiceBooking = async (userId, id) => {
  const serviceBooking = await findServiceBookingOr404(id);
  if (serviceBooking.user.id !== userId) {
    throw new AppError(403, SERVICE_REQUEST_FORBIDDEN);
  }
  return toServiceBookingResponse(serviceBooking);
};

// User chỉ tự hủy được yêu cầu còn pending.
export const cancelMyServiceBooking = async (userId, id) => {
  await withTransaction(async (conn) => {
    const serviceBooking = await serviceBookingsModel.lockServiceBookingById(id, conn);
    if (!serviceBooking) {
      throw new AppError(404, SERVICE_REQUEST_NOT_FOUND);
    }
    if (serviceBooking.user_id !== userId) {
      throw new AppError(403, SERVICE_REQUEST_FORBIDDEN);
    }
    if (serviceBooking.status !== USER_CANCELLABLE_SERVICE_STATUS) {
      throw new AppError(400, 'Only pending service requests can be cancelled');
    }

    await serviceBookingsModel.updateServiceBookingStatus(serviceBooking.id, 'cancelled', conn);
  });

  return toServiceBookingResponse(await findServiceBookingOr404(id));
};
