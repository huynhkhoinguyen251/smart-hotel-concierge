import { withTransaction } from '../../config/db.js';
import * as bookingsModel from '../../models/bookings.model.js';
import AppError from '../../utils/AppError.js';
import { formatLocalDate } from '../../utils/date.js';
import { getPagination } from '../../utils/pagination.js';
import {
  BOOKING_NOT_FOUND,
  cancelBookingWithServices,
  findBookingOr404,
  toBookingResponse,
} from '../bookings.service.js';

// Luồng trạng thái theo Mục 5 của proposal.md. Admin hủy không bị giới hạn 24 giờ.
// pending → confirmed chỉ xảy ra khi khách thanh toán (POST /payments), admin không duyệt nữa.
// Hủy đơn đã thanh toán thì thanh toán chuyển refunded (cancelBookingWithServices).
const ALLOWED_TRANSITIONS = {
  pending: ['cancelled'],
  confirmed: ['checked_in', 'cancelled'],
  checked_in: ['checked_out'],
};

export const listBookings = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [bookings, total] = await Promise.all([
    bookingsModel.findBookings({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    bookingsModel.countBookings(filters),
  ]);

  return {
    bookings: bookings.map((booking) => toBookingResponse(booking, { withUser: true })),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getBooking = async (id) =>
  toBookingResponse(await findBookingOr404(id), { withUser: true });

export const updateBookingStatus = async (id, status) => {
  await withTransaction(async (conn) => {
    const booking = await bookingsModel.lockBookingById(id, conn);
    if (!booking) {
      throw new AppError(404, BOOKING_NOT_FOUND);
    }

    if (booking.status === 'pending' && status === 'confirmed') {
      throw new AppError(400, 'Bookings are confirmed automatically when the guest pays.');
    }
    if (!ALLOWED_TRANSITIONS[booking.status]?.includes(status)) {
      throw new AppError(400, `Cannot change booking status from ${booking.status} to ${status}`);
    }
    // Chuỗi YYYY-MM-DD so sánh được trực tiếp theo thứ tự ngày.
    if (status === 'checked_in' && formatLocalDate() < booking.check_in) {
      throw new AppError(400, 'Guests cannot check in before the check-in date');
    }

    if (status === 'cancelled') {
      await cancelBookingWithServices(booking.id, conn);
    } else {
      await bookingsModel.updateBookingStatus(booking.id, status, conn);
    }
  });

  return getBooking(id);
};
