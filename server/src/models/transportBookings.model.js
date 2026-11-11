import pool from '../config/db.js';
import { buildSetClause } from './sqlHelpers.js';

const TRANSPORT_BOOKING_FROM = `
  FROM transport_bookings tr
  JOIN services s ON s.id = tr.service_id`;

const TRANSPORT_BOOKING_SELECT = `
  SELECT tr.id, tr.user_id, tr.service_id, tr.start_at, tr.end_at, tr.pickup_location,
         tr.dropoff_location, tr.flight_number, tr.vehicle_plate, tr.quantity, tr.unit_price,
         tr.total_price, tr.note, tr.status, tr.created_at,
         s.name AS service_name, s.category AS service_category,
         u.full_name AS user_full_name, u.email AS user_email
  ${TRANSPORT_BOOKING_FROM}
  JOIN users u ON u.id = tr.user_id`;

// Đơn mới nhất trước; id là thứ tự phụ khi created_at bằng nhau.
const NEWEST_FIRST = 'tr.created_at DESC, tr.id DESC';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số. start_at, end_at là chuỗi nhờ dateStrings.
const toTransportBooking = (row) => ({
  id: row.id,
  status: row.status,
  start_at: row.start_at,
  end_at: row.end_at,
  pickup_location: row.pickup_location,
  dropoff_location: row.dropoff_location,
  flight_number: row.flight_number,
  vehicle_plate: row.vehicle_plate,
  quantity: row.quantity,
  unit_price: Number(row.unit_price),
  total_price: Number(row.total_price),
  note: row.note,
  created_at: row.created_at,
  service: { id: row.service_id, name: row.service_name, category: row.service_category },
  user: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status, category }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('tr.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('tr.status = ?');
    params.push(status);
  }
  if (category !== undefined) {
    conditions.push('s.category = ?');
    params.push(category);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findTransportBookings = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${TRANSPORT_BOOKING_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toTransportBooking);
};

export const countTransportBookings = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total ${TRANSPORT_BOOKING_FROM} ${where}`,
    params,
  );
  return Number(rows[0].total);
};

export const findTransportBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${TRANSPORT_BOOKING_SELECT} WHERE tr.id = ?`, [id]);
  return rows[0] ? toTransportBooking(rows[0]) : null;
};

// Chỉ khóa dòng transport_bookings đến hết transaction. category đọc qua subquery
// nên dòng services không bị khóa theo.
export const lockTransportBookingById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT tr.id, tr.user_id, tr.status,
            (SELECT s.category FROM services s WHERE s.id = tr.service_id) AS category
     FROM transport_bookings tr WHERE tr.id = ? FOR UPDATE`,
    [id],
  );
  return rows[0] ?? null;
};

// Đơn mới luôn ở trạng thái pending và chưa có biển số xe.
export const createTransportBooking = async (
  {
    user_id,
    service_id,
    start_at,
    end_at,
    pickup_location,
    dropoff_location,
    flight_number,
    quantity,
    unit_price,
    total_price,
    note,
  },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO transport_bookings
       (user_id, service_id, start_at, end_at, pickup_location, dropoff_location, flight_number,
        quantity, unit_price, total_price, note, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      user_id,
      service_id,
      start_at,
      end_at,
      pickup_location,
      dropoff_location,
      flight_number,
      quantity,
      unit_price,
      total_price,
      note,
    ],
  );
  return result.insertId;
};

// Đổi trạng thái, và biển số xe nếu có, trong cùng một câu UPDATE.
// vehicle_plate là undefined thì giữ nguyên biển số cũ.
export const updateTransportBookingStatus = async (id, { status, vehicle_plate }, conn = pool) => {
  const { setClause, values } = buildSetClause({ status, vehicle_plate }, [
    'status',
    'vehicle_plate',
  ]);
  await conn.execute(`UPDATE transport_bookings SET ${setClause} WHERE id = ?`, [...values, id]);
};
