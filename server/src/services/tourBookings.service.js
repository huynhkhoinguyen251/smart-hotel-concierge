import { MAX_ADVANCE_DAYS } from '../config/booking.js';
import { withTransaction } from '../config/db.js';
import { USER_CANCELLABLE_SERVICE_STATUS } from '../config/services.js';
import { MIN_PARTICIPANTS } from '../config/tourism.js';
import * as tourBookingsModel from '../models/tourBookings.model.js';
import * as toursModel from '../models/tours.model.js';
import AppError from '../utils/AppError.js';
import { addDays, formatLocalDate } from '../utils/date.js';
import { multiplyPrice } from '../utils/money.js';
import { getPagination } from '../utils/pagination.js';
import { TOUR_NOT_FOUND } from './tours.service.js';

export const TOUR_BOOKING_NOT_FOUND = 'Tour booking not found';
const TOUR_BOOKING_FORBIDDEN = 'You do not have permission to access this tour booking';

// Dữ liệu trả về của một đơn tour. Đơn trong API admin có thêm user.
export const toTourBookingResponse = (tourBooking, { withUser = false } = {}) => ({
  id: tourBooking.id,
  status: tourBooking.status,
  tour_date: tourBooking.tour_date,
  participants: tourBooking.participants,
  unit_price: tourBooking.unit_price,
  total_price: tourBooking.total_price,
  note: tourBooking.note,
  created_at: tourBooking.created_at,
  tour: tourBooking.tour,
  can_cancel: tourBooking.status === USER_CANCELLABLE_SERVICE_STATUS,
  ...(withUser && { user: tourBooking.user }),
});

export const findTourBookingOr404 = async (id, conn) => {
  const tourBooking = await tourBookingsModel.findTourBookingById(id, conn);
  if (!tourBooking) {
    throw new AppError(404, TOUR_BOOKING_NOT_FOUND);
  }
  return tourBooking;
};

// tour_date phải sau hôm nay và không quá MAX_ADVANCE_DAYS ngày.
// Chuỗi YYYY-MM-DD so sánh được trực tiếp theo thứ tự ngày.
const ensureValidTourDate = (tourDate) => {
  const today = formatLocalDate();
  if (tourDate <= today) {
    throw new AppError(400, 'Tour date (tour_date) must be after today');
  }
  if (tourDate > addDays(today, MAX_ADVANCE_DAYS)) {
    throw new AppError(
      400,
      `Tour date (tour_date) cannot be more than ${MAX_ADVANCE_DAYS} days from today`,
    );
  }
};

export const createTourBooking = async (
  userId,
  { tour_id, tour_date, participants = MIN_PARTICIPANTS, note = null },
) => {
  const id = await withTransaction(async (conn) => {
    const tour = await toursModel.findTourById(tour_id, conn);
    if (!tour || !tour.is_active) {
      throw new AppError(404, TOUR_NOT_FOUND);
    }

    ensureValidTourDate(tour_date);

    // Giá lấy từ database, không tin giá do frontend gửi lên.
    return tourBookingsModel.createTourBooking(
      {
        user_id: userId,
        tour_id: tour.id,
        tour_date,
        participants,
        unit_price: tour.price,
        total_price: multiplyPrice(tour.price, participants),
        note,
      },
      conn,
    );
  });

  return toTourBookingResponse(await findTourBookingOr404(id));
};

export const listMyTourBookings = async (userId, { page, limit, status }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, status };

  const [tourBookings, total] = await Promise.all([
    tourBookingsModel.findTourBookings({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    tourBookingsModel.countTourBookings(filters),
  ]);

  return {
    tourBookings: tourBookings.map((item) => toTourBookingResponse(item)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyTourBooking = async (userId, id) => {
  const tourBooking = await findTourBookingOr404(id);
  if (tourBooking.user.id !== userId) {
    throw new AppError(403, TOUR_BOOKING_FORBIDDEN);
  }
  return toTourBookingResponse(tourBooking);
};

// User chỉ tự hủy được đơn còn pending.
export const cancelMyTourBooking = async (userId, id) => {
  await withTransaction(async (conn) => {
    const tourBooking = await tourBookingsModel.lockTourBookingById(id, conn);
    if (!tourBooking) {
      throw new AppError(404, TOUR_BOOKING_NOT_FOUND);
    }
    if (tourBooking.user_id !== userId) {
      throw new AppError(403, TOUR_BOOKING_FORBIDDEN);
    }
    if (tourBooking.status !== USER_CANCELLABLE_SERVICE_STATUS) {
      throw new AppError(400, 'Only pending tour bookings can be cancelled');
    }

    await tourBookingsModel.updateTourBookingStatus(tourBooking.id, 'cancelled', conn);
  });

  return toTourBookingResponse(await findTourBookingOr404(id));
};
