import { BLOCKING_BOOKING_STATUSES } from '../config/booking.js';
import pool from '../config/db.js';
import { primaryImageSubquery } from './roomImages.model.js';
import { buildSetClause, escapeLike, LIKE_ESCAPE, placeholders } from './sqlHelpers.js';

// Ảnh chính, nếu không có thì ảnh đầu tiên. Điểm đánh giá lấy từ reviews nối với bookings,
// gom theo phòng trong một truy vấn con, nên không phải truy vấn riêng cho từng phòng.
const ROOM_SELECT = `
  SELECT r.id, r.room_number, r.floor, r.status,
         rt.id AS room_type_id, rt.name AS room_type_name,
         rt.description AS room_type_description,
         rt.price_per_night, rt.capacity,
         ${primaryImageSubquery('r.id')} AS primary_image,
         ROUND(rs.avg_rating, 1) AS avg_rating,
         COALESCE(rs.review_count, 0) AS review_count
  FROM rooms r
  JOIN room_types rt ON rt.id = r.room_type_id
  LEFT JOIN (
    SELECT b.room_id, AVG(rv.rating) AS avg_rating, COUNT(*) AS review_count
    FROM reviews rv
    JOIN bookings b ON b.id = rv.booking_id
    GROUP BY b.room_id
  ) rs ON rs.room_id = r.id`;

// Thứ tự sắp xếp lấy từ danh sách cố định này, không ghép chuỗi từ dữ liệu gửi lên.
const SORT_ORDERS = {
  default: 'r.room_number ASC, r.id ASC',
  price_asc: 'rt.price_per_night ASC, r.room_number ASC, r.id ASC',
  price_desc: 'rt.price_per_night DESC, r.room_number ASC, r.id ASC',
  rating_desc:
    'rs.avg_rating IS NULL, rs.avg_rating DESC, review_count DESC, r.room_number ASC, r.id ASC',
};

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số.
const toRoom = (row, { withDescription = false } = {}) => ({
  id: row.id,
  room_number: row.room_number,
  floor: row.floor,
  status: row.status,
  room_type: {
    id: row.room_type_id,
    name: row.room_type_name,
    ...(withDescription && { description: row.room_type_description }),
    price_per_night: Number(row.price_per_night),
    capacity: row.capacity,
  },
  primary_image: row.primary_image ?? null,
  avg_rating: row.avg_rating === null ? null : Number(row.avg_rating),
  review_count: Number(row.review_count),
});

const toWhere = (conditions) => (conditions.length ? `WHERE ${conditions.join(' AND ')}` : '');

// Điều kiện lọc của trang tìm phòng công khai: chỉ phòng available.
const buildPublicFilters = ({
  guests,
  room_type_id,
  min_price,
  max_price,
  amenity_ids,
  check_in,
  check_out,
}) => {
  const conditions = ["r.status = 'available'"];
  const params = [];

  if (guests !== undefined) {
    conditions.push('rt.capacity >= ?');
    params.push(guests);
  }
  if (room_type_id !== undefined) {
    conditions.push('r.room_type_id = ?');
    params.push(room_type_id);
  }
  if (min_price !== undefined) {
    conditions.push('rt.price_per_night >= ?');
    params.push(min_price);
  }
  if (max_price !== undefined) {
    conditions.push('rt.price_per_night <= ?');
    params.push(max_price);
  }
  if (amenity_ids?.length) {
    // Loại phòng phải có đủ TẤT CẢ tiện nghi được chọn.
    conditions.push(`rt.id IN (
      SELECT rta.room_type_id FROM room_type_amenities rta
      WHERE rta.amenity_id IN (${placeholders(amenity_ids)})
      GROUP BY rta.room_type_id
      HAVING COUNT(DISTINCT rta.amenity_id) = ?
    )`);
    params.push(...amenity_ids, amenity_ids.length);
  }
  if (check_in !== undefined && check_out !== undefined) {
    conditions.push(`NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.room_id = r.id
        AND b.status IN (${placeholders(BLOCKING_BOOKING_STATUSES)})
        AND b.check_in < ? AND b.check_out > ?
    )`);
    params.push(...BLOCKING_BOOKING_STATUSES, check_out, check_in);
  }

  return { where: toWhere(conditions), params };
};

// Điều kiện lọc của trang quản trị: thấy mọi trạng thái.
const buildAdminFilters = ({ status, room_type_id, search }) => {
  const conditions = [];
  const params = [];

  if (status !== undefined) {
    conditions.push('r.status = ?');
    params.push(status);
  }
  if (room_type_id !== undefined) {
    conditions.push('r.room_type_id = ?');
    params.push(room_type_id);
  }
  if (search) {
    conditions.push(`r.room_number LIKE ? ESCAPE '${LIKE_ESCAPE}'`);
    params.push(`%${escapeLike(search)}%`);
  }

  return { where: toWhere(conditions), params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
// limit và offset là số nguyên đã được kiểm tra, và vẫn đi qua tham số.
const selectRoomPage = async ({ where, params, orderBy, limit, offset }, conn) => {
  const [rows] = await conn.query(`${ROOM_SELECT} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [
    ...params,
    limit,
    offset,
  ]);
  return rows.map((row) => toRoom(row));
};

const countRoomsWhere = async ({ where, params }, conn) => {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total
     FROM rooms r
     JOIN room_types rt ON rt.id = r.room_type_id
     ${where}`,
    params,
  );
  return Number(rows[0].total);
};

export const findRooms = async ({ sort, limit, offset, ...filters }, conn = pool) =>
  selectRoomPage(
    {
      ...buildPublicFilters(filters),
      orderBy: SORT_ORDERS[sort] ?? SORT_ORDERS.default,
      limit,
      offset,
    },
    conn,
  );

export const countRooms = async (filters, conn = pool) =>
  countRoomsWhere(buildPublicFilters(filters), conn);

export const findAllRooms = async ({ limit, offset, ...filters }, conn = pool) =>
  selectRoomPage(
    { ...buildAdminFilters(filters), orderBy: SORT_ORDERS.default, limit, offset },
    conn,
  );

export const countAllRooms = async (filters, conn = pool) =>
  countRoomsWhere(buildAdminFilters(filters), conn);

// Lấy cả phòng inactive; service quyết định có trả về hay không.
export const findRoomById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${ROOM_SELECT} WHERE r.id = ?`, [id]);
  return rows[0] ? toRoom(rows[0], { withDescription: true }) : null;
};

// Khóa dòng phòng đến hết transaction, để các thao tác ảnh của cùng một phòng chạy lần lượt.
export const lockRoomById = async (id, conn = pool) => {
  const [rows] = await conn.execute('SELECT id FROM rooms WHERE id = ? FOR UPDATE', [id]);
  return rows.length > 0;
};

export const createRoom = async ({ room_type_id, room_number, floor, status }, conn = pool) => {
  const [result] = await conn.execute(
    'INSERT INTO rooms (room_type_id, room_number, floor, status) VALUES (?, ?, ?, ?)',
    [room_type_id, room_number, floor, status],
  );
  return result.insertId;
};

export const updateRoom = async (id, data, conn = pool) => {
  const { setClause, values } = buildSetClause(data, ['room_type_id', 'room_number', 'floor']);
  if (!setClause) {
    return;
  }
  await conn.execute(`UPDATE rooms SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const updateRoomStatus = async (id, status, conn = pool) => {
  await conn.execute('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
};

// Ảnh của phòng tự xóa theo nhờ ON DELETE CASCADE.
export const deleteRoom = async (id, conn = pool) => {
  await conn.execute('DELETE FROM rooms WHERE id = ?', [id]);
};

// Có bất kỳ đơn nào, kể cả đơn đã hủy hoặc đã trả phòng.
export const hasAnyBooking = async (roomId, conn = pool) => {
  const [rows] = await conn.execute('SELECT 1 FROM bookings WHERE room_id = ? LIMIT 1', [roomId]);
  return rows.length > 0;
};

export const hasRoomsOfType = async (roomTypeId, conn = pool) => {
  const [rows] = await conn.execute('SELECT 1 FROM rooms WHERE room_type_id = ? LIMIT 1', [
    roomTypeId,
  ]);
  return rows.length > 0;
};

// Hai khoảng ngày trùng khi existing.check_in < check_out AND existing.check_out > check_in.
// excludeBookingId: bỏ qua chính đơn đang được đổi ngày. Nhận conn để dùng trong transaction.
export const hasOverlappingBooking = async (
  roomId,
  checkIn,
  checkOut,
  excludeBookingId = null,
  conn = pool,
) => {
  const params = [roomId, ...BLOCKING_BOOKING_STATUSES, checkOut, checkIn];
  let excludeCondition = '';
  if (excludeBookingId !== null) {
    excludeCondition = 'AND id <> ?';
    params.push(excludeBookingId);
  }

  const [rows] = await conn.execute(
    `SELECT 1 FROM bookings
     WHERE room_id = ?
       AND status IN (${placeholders(BLOCKING_BOOKING_STATUSES)})
       AND check_in < ? AND check_out > ?
       ${excludeCondition}
     LIMIT 1`,
    params,
  );
  return rows.length > 0;
};
