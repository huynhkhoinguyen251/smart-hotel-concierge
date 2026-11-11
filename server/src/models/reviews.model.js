import pool from '../config/db.js';
import { REVIEW_TARGETS } from '../config/reviews.js';

// Tên cột chỉ lấy từ config/reviews.js, không bao giờ từ dữ liệu người dùng.
const TARGET_COLUMNS = REVIEW_TARGETS.map((target) => target.column);
const columnOfType = (type) => REVIEW_TARGETS.find((target) => target.type === type)?.column;

// LEFT JOIN đến từng loại đơn để lấy tên hiển thị của đối tượng được đánh giá.
// Chỉ lấy id, họ tên và email của người viết; không bao giờ lấy password_hash.
const REVIEW_FROM = `
  FROM reviews rv
  JOIN users u ON u.id = rv.user_id
  LEFT JOIN bookings b ON b.id = rv.booking_id
  LEFT JOIN rooms r ON r.id = b.room_id
  LEFT JOIN service_bookings sb ON sb.id = rv.service_booking_id
  LEFT JOIN services s ON s.id = sb.service_id
  LEFT JOIN tour_bookings tb ON tb.id = rv.tour_booking_id
  LEFT JOIN tours t ON t.id = tb.tour_id
  LEFT JOIN transport_bookings trb ON trb.id = rv.transport_booking_id
  LEFT JOIN services ts ON ts.id = trb.service_id`;

// Tên hiển thị theo loại: "Room 301", tên dịch vụ, "Food order #5", tên tour,
// hoặc tên dịch vụ vận chuyển.
const TARGET_NAME_SQL = {
  booking_id: "CONCAT('Room ', r.room_number)",
  service_booking_id: 's.name',
  food_order_id: "CONCAT('Food order #', rv.food_order_id)",
  tour_booking_id: 't.name',
  transport_booking_id: 'ts.name',
};

const caseByTarget = (valueOf) =>
  `CASE ${REVIEW_TARGETS.map(
    (target) => `WHEN rv.${target.column} IS NOT NULL THEN ${valueOf(target)}`,
  ).join(' ')} END`;

const REVIEW_SELECT = `
  SELECT rv.id, rv.rating, rv.comment, rv.created_at,
         ${caseByTarget((target) => `'${target.type}'`)} AS target_type,
         COALESCE(${TARGET_COLUMNS.map((column) => `rv.${column}`).join(', ')}) AS target_id,
         ${caseByTarget((target) => TARGET_NAME_SQL[target.column])} AS target_name,
         rv.user_id, u.full_name AS user_full_name, u.email AS user_email
  ${REVIEW_FROM}`;

// Đánh giá mới nhất trước; id là thứ tự phụ khi created_at bằng nhau.
const NEWEST_FIRST = 'rv.created_at DESC, rv.id DESC';

const toReview = (row) => ({
  id: row.id,
  rating: Number(row.rating),
  comment: row.comment,
  created_at: row.created_at,
  target: { type: row.target_type, id: row.target_id, name: row.target_name },
  reviewer: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

// room_id, service_id, tour_id dùng cho danh sách công khai; user_id, rating, type cho admin.
const buildFilters = ({ user_id, rating, type, room_id, service_id, tour_id }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('rv.user_id = ?');
    params.push(user_id);
  }
  if (rating !== undefined) {
    conditions.push('rv.rating = ?');
    params.push(rating);
  }
  if (type !== undefined) {
    conditions.push(`rv.${columnOfType(type)} IS NOT NULL`);
  }
  if (room_id !== undefined) {
    conditions.push('b.room_id = ?');
    params.push(room_id);
  }
  // Một dịch vụ được đánh giá qua yêu cầu dịch vụ khách sạn hoặc qua đơn vận chuyển.
  if (service_id !== undefined) {
    conditions.push('(sb.service_id = ? OR trb.service_id = ?)');
    params.push(service_id, service_id);
  }
  if (tour_id !== undefined) {
    conditions.push('tb.tour_id = ?');
    params.push(tour_id);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findReviews = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${REVIEW_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toReview);
};

export const countReviews = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total ${REVIEW_FROM} ${where}`, params);
  return Number(rows[0].total);
};

// Số đánh giá và điểm trung bình (làm tròn 1 chữ số); null khi chưa có đánh giá.
export const getReviewSummary = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS review_count, ROUND(AVG(rv.rating), 1) AS average_rating
     ${REVIEW_FROM} ${where}`,
    params,
  );
  const { review_count, average_rating } = rows[0];
  return {
    average_rating: average_rating === null ? null : Number(average_rating),
    review_count: Number(review_count),
  };
};

export const findReviewById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${REVIEW_SELECT} WHERE rv.id = ?`, [id]);
  return rows[0] ? toReview(rows[0]) : null;
};

const ensureTargetColumn = (column) => {
  if (!TARGET_COLUMNS.includes(column)) {
    throw new Error(`Unknown review target column: ${column}`);
  }
};

export const hasReviewForTarget = async (column, targetId, conn = pool) => {
  ensureTargetColumn(column);
  const [rows] = await conn.execute(
    `SELECT EXISTS (SELECT 1 FROM reviews WHERE ${column} = ?) AS reviewed`,
    [targetId],
  );
  return Boolean(rows[0].reviewed);
};

// Chỉ ghi cột của đúng một loại đơn; các cột còn lại để NULL.
export const createReview = async (
  { user_id, column, target_id, rating, comment },
  conn = pool,
) => {
  ensureTargetColumn(column);
  const [result] = await conn.execute(
    `INSERT INTO reviews (user_id, ${column}, rating, comment) VALUES (?, ?, ?, ?)`,
    [user_id, target_id, rating, comment],
  );
  return result.insertId;
};
