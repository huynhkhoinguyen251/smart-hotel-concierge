import { CANCELLABLE_SERVICE_STATUSES } from '../config/booking.js';
import pool from '../config/db.js';
import { placeholders } from './sqlHelpers.js';

// Hủy các yêu cầu dịch vụ còn pending hoặc confirmed của một đơn đặt phòng.
// Trả về số yêu cầu đã hủy. Nên gọi trong cùng transaction với việc hủy đơn.
export const cancelActiveServiceBookings = async (bookingId, conn = pool) => {
  const [result] = await conn.execute(
    `UPDATE service_bookings SET status = 'cancelled'
     WHERE booking_id = ? AND status IN (${placeholders(CANCELLABLE_SERVICE_STATUSES)})`,
    [bookingId, ...CANCELLABLE_SERVICE_STATUSES],
  );
  return result.affectedRows;
};
