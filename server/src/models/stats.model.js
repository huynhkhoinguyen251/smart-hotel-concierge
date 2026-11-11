import { BOOKING_STATUSES } from '../config/booking.js';
import pool from '../config/db.js';
import { REVIEW_TARGETS } from '../config/reviews.js';
import { EXCLUDED_USAGE_STATUS, REVENUE_SOURCES } from '../config/stats.js';

// Mọi phép cộng và đếm chạy trong SQL. Tên bảng, cột và bí danh chỉ lấy từ file config,
// không bao giờ từ dữ liệu người dùng; giá trị (trạng thái, năm, limit) đi qua tham số.
// Tiền được làm tròn 2 chữ số trong SQL rồi đổi sang số, vì MySQL trả DECIMAL dưới dạng chuỗi.

const toMoney = (value) => Number(value ?? 0);

// Mỗi khoản doanh thu thành một dòng (kind, used_at, amount), gộp bằng UNION ALL.
const REVENUE_ROWS_SQL = REVENUE_SOURCES.map(
  ({ key, table, usedAt }) =>
    `SELECT '${key}' AS kind, ${usedAt} AS used_at, total_price AS amount
     FROM ${table} WHERE status = ?`,
).join(' UNION ALL ');
const REVENUE_ROWS_PARAMS = REVENUE_SOURCES.map((source) => source.doneStatus);

const REVENUE_COLUMNS_SQL = [
  ...REVENUE_SOURCES.map(
    ({ key }) =>
      `ROUND(COALESCE(SUM(CASE WHEN rev.kind = '${key}' THEN rev.amount END), 0), 2) AS ${key}`,
  ),
  'ROUND(COALESCE(SUM(rev.amount), 0), 2) AS total',
].join(', ');

const toRevenue = (row) => ({
  ...Object.fromEntries(REVENUE_SOURCES.map(({ key }) => [key, toMoney(row[key])])),
  total: toMoney(row.total),
});

// Tổng doanh thu từ trước đến nay, kèm phần của từng loại.
export const getRevenueTotals = async (conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT ${REVENUE_COLUMNS_SQL} FROM (${REVENUE_ROWS_SQL}) rev`,
    REVENUE_ROWS_PARAMS,
  );
  return toRevenue(rows[0]);
};

// Doanh thu theo tháng của một năm. Chỉ trả các tháng có doanh thu; service bù tháng trống.
export const getMonthlyRevenue = async (year, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT MONTH(rev.used_at) AS month, ${REVENUE_COLUMNS_SQL}
     FROM (${REVENUE_ROWS_SQL}) rev
     WHERE YEAR(rev.used_at) = ?
     GROUP BY MONTH(rev.used_at)
     ORDER BY month`,
    [...REVENUE_ROWS_PARAMS, year],
  );
  return rows.map((row) => ({ month: Number(row.month), ...toRevenue(row) }));
};

// Số đơn đặt phòng theo từng trạng thái, và tổng số đơn không tính đơn đã hủy.
export const getBookingCounts = async (conn = pool) => {
  const statusColumns = BOOKING_STATUSES.map(
    (status) => `COUNT(CASE WHEN status = ? THEN 1 END) AS ${status}`,
  ).join(', ');
  const [rows] = await conn.execute(
    `SELECT COUNT(CASE WHEN status <> ? THEN 1 END) AS total, ${statusColumns} FROM bookings`,
    [EXCLUDED_USAGE_STATUS, ...BOOKING_STATUSES],
  );
  const row = rows[0];
  return {
    total: Number(row.total),
    by_status: Object.fromEntries(BOOKING_STATUSES.map((status) => [status, Number(row[status])])),
  };
};

// Chỉ đếm tài khoản vai trò user, không tính admin.
export const getUserCounts = async (conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total, COUNT(CASE WHEN is_active = 1 THEN 1 END) AS active
     FROM users WHERE role = 'user'`,
  );
  return { total: Number(rows[0].total), active: Number(rows[0].active) };
};

// Phòng có nhiều lượt đặt nhất (không tính đơn đã hủy). Doanh thu chỉ tính đơn checked_out.
export const findTopRooms = async (limit, conn = pool) => {
  const [rows] = await conn.query(
    `SELECT r.id, r.room_number, rt.id AS room_type_id, rt.name AS room_type_name,
            COUNT(*) AS booking_count,
            ROUND(COALESCE(SUM(CASE WHEN b.status = 'checked_out' THEN b.total_price END), 0), 2)
              AS revenue
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     WHERE b.status <> ?
     GROUP BY r.id, r.room_number, rt.id, rt.name
     ORDER BY booking_count DESC, r.id ASC
     LIMIT ?`,
    [EXCLUDED_USAGE_STATUS, limit],
  );
  return rows.map((row) => ({
    room: {
      id: row.id,
      room_number: row.room_number,
      room_type: { id: row.room_type_id, name: row.room_type_name },
    },
    booking_count: Number(row.booking_count),
    revenue: toMoney(row.revenue),
  }));
};

// Dịch vụ được dùng nhiều nhất: yêu cầu dịch vụ khách sạn cộng đơn vận chuyển dùng dịch vụ đó,
// không tính đơn đã hủy. Doanh thu chỉ tính đơn completed. Tour không nằm trong danh sách này.
export const findTopServices = async (limit, conn = pool) => {
  const [rows] = await conn.query(
    `SELECT s.id, s.name, s.category, COUNT(*) AS usage_count,
            ROUND(
              COALESCE(SUM(CASE WHEN used.status = 'completed' THEN used.total_price END), 0),
              2
            ) AS revenue
     FROM (
       SELECT service_id, status, total_price FROM service_bookings WHERE status <> ?
       UNION ALL
       SELECT service_id, status, total_price FROM transport_bookings WHERE status <> ?
     ) used
     JOIN services s ON s.id = used.service_id
     GROUP BY s.id, s.name, s.category
     ORDER BY usage_count DESC, s.id ASC
     LIMIT ?`,
    [EXCLUDED_USAGE_STATUS, EXCLUDED_USAGE_STATUS, limit],
  );
  return rows.map((row) => ({
    service: { id: row.id, name: row.name, category: row.category },
    usage_count: Number(row.usage_count),
    revenue: toMoney(row.revenue),
  }));
};

const RATINGS = [1, 2, 3, 4, 5];
const toAverage = (value) => (value === null ? null : Number(value));

// Điểm trung bình (làm tròn 1 chữ số, null khi chưa có đánh giá), số đánh giá theo từng mức sao
// và theo từng loại đơn, trong một câu lệnh.
export const getFeedbackStats = async (conn = pool) => {
  const ratingColumns = RATINGS.map(
    (rating) => `COUNT(CASE WHEN rating = ${rating} THEN 1 END) AS rating_${rating}`,
  );
  const typeColumns = REVIEW_TARGETS.flatMap(({ column, type }) => [
    `COUNT(${column}) AS count_${type}`,
    `ROUND(AVG(CASE WHEN ${column} IS NOT NULL THEN rating END), 1) AS avg_${type}`,
  ]);
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS review_count, ROUND(AVG(rating), 1) AS average_rating,
            ${[...ratingColumns, ...typeColumns].join(', ')}
     FROM reviews`,
  );
  const row = rows[0];
  return {
    average_rating: toAverage(row.average_rating),
    review_count: Number(row.review_count),
    by_rating: Object.fromEntries(
      RATINGS.map((rating) => [rating, Number(row[`rating_${rating}`])]),
    ),
    by_type: REVIEW_TARGETS.map(({ type }) => ({
      type,
      average_rating: toAverage(row[`avg_${type}`]),
      review_count: Number(row[`count_${type}`]),
    })),
  };
};
