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

// Yêu cầu dịch vụ không có user_id riêng; chủ yêu cầu là chủ đơn đặt phòng (bookings.user_id).
const SERVICE_BOOKING_FROM = `
  FROM service_bookings sb
  JOIN services s ON s.id = sb.service_id
  JOIN bookings b ON b.id = sb.booking_id`;

const SERVICE_BOOKING_SELECT = `
  SELECT sb.id, sb.booking_id, sb.service_id, sb.scheduled_at, sb.quantity, sb.unit_price,
         sb.total_price, sb.note, sb.status, sb.created_at,
         s.name AS service_name, s.category AS service_category,
         b.user_id, b.room_id, r.room_number,
         u.full_name AS user_full_name, u.email AS user_email
  ${SERVICE_BOOKING_FROM}
  JOIN rooms r ON r.id = b.room_id
  JOIN users u ON u.id = b.user_id`;

// Yêu cầu mới nhất trước; id là thứ tự phụ khi created_at bằng nhau.
const NEWEST_FIRST = 'sb.created_at DESC, sb.id DESC';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số. scheduled_at là chuỗi nhờ dateStrings.
const toServiceBooking = (row) => ({
  id: row.id,
  status: row.status,
  scheduled_at: row.scheduled_at,
  quantity: row.quantity,
  unit_price: Number(row.unit_price),
  total_price: Number(row.total_price),
  note: row.note,
  created_at: row.created_at,
  service: { id: row.service_id, name: row.service_name, category: row.service_category },
  booking: { id: row.booking_id, room: { id: row.room_id, room_number: row.room_number } },
  user: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status, category }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('b.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('sb.status = ?');
    params.push(status);
  }
  if (category !== undefined) {
    conditions.push('s.category = ?');
    params.push(category);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findServiceBookings = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${SERVICE_BOOKING_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toServiceBooking);
};

export const countServiceBookings = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total ${SERVICE_BOOKING_FROM} ${where}`,
    params,
  );
  return Number(rows[0].total);
};

export const findServiceBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${SERVICE_BOOKING_SELECT} WHERE sb.id = ?`, [id]);
  return rows[0] ? toServiceBooking(rows[0]) : null;
};

// Chỉ khóa dòng service_bookings đến hết transaction. user_id đọc qua subquery nên
// dòng bookings không bị khóa theo, tránh khóa chéo với việc hủy đơn đặt phòng.
export const lockServiceBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT sb.id, sb.booking_id, sb.status,
            (SELECT b.user_id FROM bookings b WHERE b.id = sb.booking_id) AS user_id
     FROM service_bookings sb WHERE sb.id = ? FOR UPDATE`,
    [id],
  );
  return rows[0] ?? null;
};

// Yêu cầu mới luôn ở trạng thái pending.
export const createServiceBooking = async (
  { booking_id, service_id, scheduled_at, quantity, unit_price, total_price, note },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO service_bookings
       (booking_id, service_id, scheduled_at, quantity, unit_price, total_price, note, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [booking_id, service_id, scheduled_at, quantity, unit_price, total_price, note],
  );
  return result.insertId;
};

export const updateServiceBookingStatus = async (id, status, conn = pool) => {
  await conn.execute('UPDATE service_bookings SET status = ? WHERE id = ?', [status, id]);
};
