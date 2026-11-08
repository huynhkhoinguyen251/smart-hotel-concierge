import pool from '../config/db.js';
import { primaryImageSubquery } from './roomImages.model.js';
import { buildSetClause } from './sqlHelpers.js';

const BOOKING_SELECT = `
  SELECT b.id, b.user_id, b.room_id, b.status, b.check_in, b.check_out, b.guests,
         b.price_per_night, b.discount_amount, b.total_price, b.created_at,
         r.room_number, rt.id AS room_type_id, rt.name AS room_type_name,
         ${primaryImageSubquery('r.id')} AS primary_image,
         u.full_name AS user_full_name, u.email AS user_email
  FROM bookings b
  JOIN rooms r ON r.id = b.room_id
  JOIN room_types rt ON rt.id = r.room_type_id
  JOIN users u ON u.id = b.user_id`;

// Đơn mới nhất trước; id là thứ tự phụ khi created_at bằng nhau.
const NEWEST_FIRST = 'b.created_at DESC, b.id DESC';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số. Ngày là chuỗi nhờ dateStrings.
const toBooking = (row) => ({
  id: row.id,
  user_id: row.user_id,
  status: row.status,
  check_in: row.check_in,
  check_out: row.check_out,
  guests: row.guests,
  price_per_night: Number(row.price_per_night),
  discount_amount: Number(row.discount_amount),
  total_price: Number(row.total_price),
  created_at: row.created_at,
  room: {
    id: row.room_id,
    room_number: row.room_number,
    room_type: { id: row.room_type_id, name: row.room_type_name },
    primary_image: row.primary_image ?? null,
  },
  user: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status, room_id, check_in_from, check_in_to }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('b.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('b.status = ?');
    params.push(status);
  }
  if (room_id !== undefined) {
    conditions.push('b.room_id = ?');
    params.push(room_id);
  }
  if (check_in_from !== undefined) {
    conditions.push('b.check_in >= ?');
    params.push(check_in_from);
  }
  if (check_in_to !== undefined) {
    conditions.push('b.check_in <= ?');
    params.push(check_in_to);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findBookings = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${BOOKING_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toBooking);
};

export const countBookings = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM bookings b ${where}`, params);
  return Number(rows[0].total);
};

export const findBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${BOOKING_SELECT} WHERE b.id = ?`, [id]);
  return rows[0] ? toBooking(rows[0]) : null;
};

// Khóa dòng đơn đến hết transaction và trả các cột cần để kiểm tra quy tắc.
export const lockBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT id, user_id, room_id, status, check_in, check_out, guests, price_per_night
     FROM bookings WHERE id = ? FOR UPDATE`,
    [id],
  );
  return rows[0] ? { ...rows[0], price_per_night: Number(rows[0].price_per_night) } : null;
};

// Đơn mới luôn ở trạng thái pending, chưa có giảm giá.
export const createBooking = async (
  { user_id, room_id, check_in, check_out, guests, price_per_night, total_price },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO bookings
       (user_id, room_id, voucher_id, check_in, check_out, guests,
        price_per_night, discount_amount, total_price, status)
     VALUES (?, ?, NULL, ?, ?, ?, ?, 0, ?, 'pending')`,
    [user_id, room_id, check_in, check_out, guests, price_per_night, total_price],
  );
  return result.insertId;
};

// Đổi ngày, số khách và tổng tiền. price_per_night đã lưu không bao giờ bị đổi ở đây.
export const updateBookingStay = async (id, data, conn = pool) => {
  const { setClause, values } = buildSetClause(data, [
    'check_in',
    'check_out',
    'guests',
    'total_price',
  ]);
  if (!setClause) {
    return;
  }
  await conn.execute(`UPDATE bookings SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const updateBookingStatus = async (id, status, conn = pool) => {
  await conn.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
};
