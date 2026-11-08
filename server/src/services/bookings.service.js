import {
  CANCEL_DEADLINE_HOURS,
  CANCELLABLE_BOOKING_STATUSES,
  CHECK_IN_HOUR,
} from '../config/booking.js';
import { withTransaction } from '../config/db.js';
import * as bookingsModel from '../models/bookings.model.js';
import * as roomsModel from '../models/rooms.model.js';
import * as serviceBookingsModel from '../models/serviceBookings.model.js';
import AppError from '../utils/AppError.js';
import { countNights, toLocalDateTime } from '../utils/date.js';
import { getPagination } from '../utils/pagination.js';

export const BOOKING_NOT_FOUND = 'Booking not found';
const ROOM_NOT_FOUND = 'Room not found';
const ROOM_BOOKED = 'Room is already booked for these dates';

const MS_PER_HOUR = 60 * 60 * 1000;

// Làm tròn 2 chữ số để tránh sai số khi nhân số thập phân trong JavaScript.
const calculateTotal = (nights, pricePerNight) => Math.round(nights * pricePerNight * 100) / 100;

// User tự hủy được khi đơn còn pending hoặc confirmed, và còn ít nhất 24 giờ
// trước 14:00 ngày check-in, tính theo giờ địa phương của server.
export const canUserCancel = ({ status, check_in }, now = new Date()) =>
  CANCELLABLE_BOOKING_STATUSES.includes(status) &&
  toLocalDateTime(check_in, CHECK_IN_HOUR) - now >= CANCEL_DEADLINE_HOURS * MS_PER_HOUR;

// Dữ liệu trả về của một đơn. Đơn trong API admin có thêm user.
export const toBookingResponse = (booking, { withUser = false } = {}) => ({
  id: booking.id,
  status: booking.status,
  check_in: booking.check_in,
  check_out: booking.check_out,
  nights: countNights(booking.check_in, booking.check_out),
  guests: booking.guests,
  price_per_night: booking.price_per_night,
  discount_amount: booking.discount_amount,
  total_price: booking.total_price,
  created_at: booking.created_at,
  room: booking.room,
  can_edit: booking.status === 'pending',
  can_cancel: canUserCancel(booking),
  ...(withUser && { user: booking.user }),
});

export const findBookingOr404 = async (id, conn) => {
  const booking = await bookingsModel.findBookingById(id, conn);
  if (!booking) {
    throw new AppError(404, BOOKING_NOT_FOUND);
  }
  return booking;
};

// Khóa đơn và kiểm tra đơn thuộc về user đang đăng nhập.
const lockOwnBooking = async (userId, bookingId, conn) => {
  const booking = await bookingsModel.lockBookingById(bookingId, conn);
  if (!booking) {
    throw new AppError(404, BOOKING_NOT_FOUND);
  }
  if (booking.user_id !== userId) {
    throw new AppError(403, 'You do not have permission to access this booking');
  }
  return booking;
};

// Hủy đơn và các yêu cầu dịch vụ còn pending hoặc confirmed của đơn, trong transaction đang mở.
export const cancelBookingWithServices = async (bookingId, conn) => {
  await bookingsModel.updateBookingStatus(bookingId, 'cancelled', conn);
  await serviceBookingsModel.cancelActiveServiceBookings(bookingId, conn);
};

export const createBooking = async (userId, { room_id, check_in, check_out, guests }) => {
  const bookingId = await withTransaction(async (conn) => {
    // Khóa phòng trước, để hai người đặt cùng phòng cùng lúc phải chạy lần lượt.
    if (!(await roomsModel.lockRoomById(room_id, conn))) {
      throw new AppError(404, ROOM_NOT_FOUND);
    }

    const room = await roomsModel.findRoomById(room_id, conn);
    if (room.status === 'inactive') {
      throw new AppError(404, ROOM_NOT_FOUND);
    }
    if (room.status === 'maintenance') {
      throw new AppError(409, 'Room is under maintenance and cannot be booked');
    }
    if (guests > room.room_type.capacity) {
      throw new AppError(400, `This room allows at most ${room.room_type.capacity} guests`);
    }
    if (await roomsModel.hasOverlappingBooking(room_id, check_in, check_out, null, conn)) {
      throw new AppError(409, ROOM_BOOKED);
    }

    // Giá lấy từ database, không tin giá do frontend gửi lên.
    const pricePerNight = room.room_type.price_per_night;
    return bookingsModel.createBooking(
      {
        user_id: userId,
        room_id,
        check_in,
        check_out,
        guests,
        price_per_night: pricePerNight,
        total_price: calculateTotal(countNights(check_in, check_out), pricePerNight),
      },
      conn,
    );
  });

  return toBookingResponse(await findBookingOr404(bookingId));
};

export const listMyBookings = async (userId, { page, limit, status }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, status };

  const [bookings, total] = await Promise.all([
    bookingsModel.findBookings({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    bookingsModel.countBookings(filters),
  ]);

  return {
    bookings: bookings.map((booking) => toBookingResponse(booking)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyBooking = async (userId, id) => {
  const booking = await findBookingOr404(id);
  if (booking.user_id !== userId) {
    throw new AppError(403, 'You do not have permission to access this booking');
  }
  return toBookingResponse(booking);
};

// Đổi ngày và/hoặc số khách khi đơn còn pending. Giữ giá đã lưu, tính lại tổng tiền.
export const updateMyBooking = async (userId, id, { check_in, check_out, guests }) => {
  await withTransaction(async (conn) => {
    const booking = await lockOwnBooking(userId, id, conn);
    if (booking.status !== 'pending') {
      throw new AppError(400, 'Only pending bookings can be changed');
    }

    await roomsModel.lockRoomById(booking.room_id, conn);

    const newCheckIn = check_in ?? booking.check_in;
    const newCheckOut = check_out ?? booking.check_out;
    const newGuests = guests ?? booking.guests;

    if (guests !== undefined) {
      const room = await roomsModel.findRoomById(booking.room_id, conn);
      if (guests > room.room_type.capacity) {
        throw new AppError(400, `This room allows at most ${room.room_type.capacity} guests`);
      }
    }

    // Kiểm tra lại phòng trống, bỏ qua chính đơn này.
    if (
      check_in !== undefined &&
      (await roomsModel.hasOverlappingBooking(booking.room_id, newCheckIn, newCheckOut, booking.id, conn))
    ) {
      throw new AppError(409, ROOM_BOOKED);
    }

    await bookingsModel.updateBookingStay(
      booking.id,
      {
        check_in: newCheckIn,
        check_out: newCheckOut,
        guests: newGuests,
        total_price: calculateTotal(countNights(newCheckIn, newCheckOut), booking.price_per_night),
      },
      conn,
    );
  });

  return toBookingResponse(await findBookingOr404(id));
};

export const cancelMyBooking = async (userId, id) => {
  await withTransaction(async (conn) => {
    const booking = await lockOwnBooking(userId, id, conn);
    if (!CANCELLABLE_BOOKING_STATUSES.includes(booking.status)) {
      throw new AppError(400, 'Only pending or confirmed bookings can be cancelled');
    }
    if (!canUserCancel(booking)) {
      throw new AppError(
        400,
        `Bookings can only be cancelled online at least ${CANCEL_DEADLINE_HOURS} hours before check-in (${CHECK_IN_HOUR}:00). Please contact the reception desk.`,
      );
    }

    await cancelBookingWithServices(booking.id, conn);
  });

  return toBookingResponse(await findBookingOr404(id));
};
