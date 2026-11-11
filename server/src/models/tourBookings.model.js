import pool from '../config/db.js';

const TOUR_BOOKING_FROM = `
  FROM tour_bookings tb
  JOIN tours t ON t.id = tb.tour_id`;

const TOUR_BOOKING_SELECT = `
  SELECT tb.id, tb.user_id, tb.tour_id, tb.tour_date, tb.participants, tb.unit_price,
         tb.total_price, tb.note, tb.status, tb.created_at,
         t.name AS tour_name, t.location AS tour_location, t.duration AS tour_duration,
         u.full_name AS user_full_name, u.email AS user_email
  ${TOUR_BOOKING_FROM}
  JOIN users u ON u.id = tb.user_id`;

// Đơn mới nhất trước; id là thứ tự phụ khi created_at bằng nhau.
const NEWEST_FIRST = 'tb.created_at DESC, tb.id DESC';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số. tour_date là chuỗi nhờ dateStrings.
const toTourBooking = (row) => ({
  id: row.id,
  status: row.status,
  tour_date: row.tour_date,
  participants: row.participants,
  unit_price: Number(row.unit_price),
  total_price: Number(row.total_price),
  note: row.note,
  created_at: row.created_at,
  tour: {
    id: row.tour_id,
    name: row.tour_name,
    location: row.tour_location,
    duration: row.tour_duration,
  },
  user: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('tb.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('tb.status = ?');
    params.push(status);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findTourBookings = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${TOUR_BOOKING_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toTourBooking);
};

export const countTourBookings = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total ${TOUR_BOOKING_FROM} ${where}`,
    params,
  );
  return Number(rows[0].total);
};

export const findTourBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${TOUR_BOOKING_SELECT} WHERE tb.id = ?`, [id]);
  return rows[0] ? toTourBooking(rows[0]) : null;
};

// Chỉ khóa dòng tour_bookings đến hết transaction.
export const lockTourBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT id, user_id, status FROM tour_bookings WHERE id = ? FOR UPDATE',
    [id],
  );
  return rows[0] ?? null;
};

// Đơn mới luôn ở trạng thái pending.
export const createTourBooking = async (
  { user_id, tour_id, tour_date, participants, unit_price, total_price, note },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO tour_bookings
       (user_id, tour_id, tour_date, participants, unit_price, total_price, note, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [user_id, tour_id, tour_date, participants, unit_price, total_price, note],
  );
  return result.insertId;
};

export const updateTourBookingStatus = async (id, status, conn = pool) => {
  await conn.execute('UPDATE tour_bookings SET status = ? WHERE id = ?', [status, id]);
};
