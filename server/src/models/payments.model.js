import pool from '../config/db.js';
import { getPaymentTargetByColumn, PAYMENT_TARGETS } from '../config/payments.js';
import { CANCELLABLE_SERVICE_STATUSES } from '../config/booking.js';
import { placeholders } from './sqlHelpers.js';

// Tên bảng và cách lấy chủ đơn của từng loại đơn. Tên cột và bảng chỉ lấy từ đây hoặc từ
// config/payments.js, không bao giờ từ dữ liệu người dùng; mọi giá trị đi qua tham số.
// Yêu cầu dịch vụ và đơn đồ ăn không có user_id riêng: chủ đơn là chủ đơn đặt phòng.
const ORDER_TABLES = {
  booking_id: { table: 'bookings', owner: 'o.user_id' },
  service_booking_id: {
    table: 'service_bookings',
    owner: '(SELECT b.user_id FROM bookings b WHERE b.id = o.booking_id)',
  },
  food_order_id: {
    table: 'food_orders',
    owner: '(SELECT b.user_id FROM bookings b WHERE b.id = o.booking_id)',
  },
  tour_booking_id: { table: 'tour_bookings', owner: 'o.user_id' },
  transport_booking_id: { table: 'transport_bookings', owner: 'o.user_id' },
};

const orderTableOf = (column) => {
  if (!getPaymentTargetByColumn(column)) {
    throw new Error(`Unknown payment target column: ${column}`);
  }
  return ORDER_TABLES[column];
};

// ----- Tóm tắt thanh toán gắn vào dữ liệu trả về của đơn -----

// Cột và JOIN để thêm thanh toán (và số hóa đơn) vào câu SELECT của một loại đơn.
// order_age là số giây từ lúc tạo đơn, do database tính, để đếm ngược theo giờ của database.
export const paymentSummarySql = (column, orderAlias) => {
  orderTableOf(column);
  return {
    columns: `pay.id AS payment_id, pay.status AS payment_status, pay.method AS payment_method,
         pay.amount AS payment_amount, pay.paid_at AS payment_paid_at,
         inv.invoice_number AS payment_invoice_number,
         TIMESTAMPDIFF(SECOND, ${orderAlias}.created_at, NOW()) AS payment_order_age`,
    joins: `LEFT JOIN payments pay ON pay.${column} = ${orderAlias}.id
  LEFT JOIN invoices inv ON inv.payment_id = pay.id`,
  };
};

// Đơn cũ (trước khi có thanh toán QR) không có thanh toán: trả null.
export const toPaymentSummaryRow = (row) =>
  row.payment_id
    ? {
        id: row.payment_id,
        status: row.payment_status,
        method: row.payment_method,
        amount: Number(row.payment_amount),
        paid_at: row.payment_paid_at,
        invoice_number: row.payment_invoice_number ?? null,
        order_age_seconds: Number(row.payment_order_age),
      }
    : null;

// ----- Tạo và đổi trạng thái thanh toán (gọi trong transaction của đơn) -----

// Thanh toán QR mới của một đơn: ví điện tử, chưa trả.
export const createPayment = async ({ user_id, column, target_id, amount }, conn = pool) => {
  orderTableOf(column);
  const [result] = await conn.execute(
    `INSERT INTO payments (user_id, ${column}, amount, method, status)
     VALUES (?, ?, ?, 'e_wallet', 'unpaid')`,
    [user_id, target_id, amount],
  );
  return result.insertId;
};

// Đổi số tiền của thanh toán chưa trả, ví dụ sau khi khách đổi ngày đơn đặt phòng.
export const updateUnpaidAmount = async (column, targetId, amount, conn = pool) => {
  orderTableOf(column);
  await conn.execute(
    `UPDATE payments SET amount = ? WHERE ${column} = ? AND status = 'unpaid'`,
    [amount, targetId],
  );
};

// Hủy đơn đã thanh toán thì thanh toán chuyển refunded. Thanh toán chưa trả giữ nguyên unpaid.
export const refundPaidPayment = async (column, targetId, conn = pool) => {
  orderTableOf(column);
  await conn.execute(
    `UPDATE payments SET status = 'refunded' WHERE ${column} = ? AND status = 'paid'`,
    [targetId],
  );
};

// Hoàn tiền các yêu cầu dịch vụ đã trả của một đơn đặt phòng, đúng những yêu cầu sắp bị hủy
// theo đơn (pending hoặc confirmed). Phải gọi trước khi hủy các yêu cầu đó.
export const refundActiveServicePaymentsOfBooking = async (bookingId, conn = pool) => {
  await conn.execute(
    `UPDATE payments pay
     JOIN service_bookings sb ON sb.id = pay.service_booking_id
     SET pay.status = 'refunded'
     WHERE sb.booking_id = ? AND pay.status = 'paid'
       AND sb.status IN (${placeholders(CANCELLABLE_SERVICE_STATUSES)})`,
    [bookingId, ...CANCELLABLE_SERVICE_STATUSES],
  );
};

// Trạng thái thanh toán của một đơn, hoặc null nếu đơn không có thanh toán.
export const findPaymentStatusByTarget = async (column, targetId, conn = pool) => {
  orderTableOf(column);
  const [rows] = await conn.execute(`SELECT status FROM payments WHERE ${column} = ?`, [targetId]);
  return rows[0]?.status ?? null;
};

// ----- Thanh toán ("I have paid") -----

// Khóa đơn và thanh toán của đơn đến hết transaction. expired: đơn đã quá hạn giữ,
// tính bằng giờ của database (NOW() theo múi giờ +07:00 của phiên kết nối).
export const lockOrderForPayment = async (column, orderId, holdMinutes, conn = pool) => {
  const { table, owner } = orderTableOf(column);
  const [rows] = await conn.execute(
    `SELECT o.id AS order_id, o.status AS order_status, ${owner} AS owner_id,
            o.created_at < NOW() - INTERVAL ? MINUTE AS expired,
            pay.id AS payment_id, pay.status AS payment_status
     FROM ${table} o
     LEFT JOIN payments pay ON pay.${column} = o.id
     WHERE o.id = ?
     FOR UPDATE`,
    [holdMinutes, orderId],
  );
  const row = rows[0];
  return row
    ? {
        order_id: row.order_id,
        order_status: row.order_status,
        owner_id: row.owner_id,
        expired: Boolean(row.expired),
        payment_id: row.payment_id,
        payment_status: row.payment_status,
      }
    : null;
};

export const markPaymentPaid = async (id, conn = pool) => {
  await conn.execute("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id = ?", [id]);
};

// Số hóa đơn dạng INV-YYYYMMDD-000042: ngày theo giờ của database, số là id thanh toán
// (đã thêm số 0 ở service), nên không trùng nhau.
export const createInvoice = async (paymentId, paddedId, conn = pool) => {
  await conn.execute(
    `INSERT INTO invoices (payment_id, invoice_number, issued_at)
     VALUES (?, CONCAT('INV-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', ?), NOW())`,
    [paymentId, paddedId],
  );
};

export const findInvoiceByPaymentId = async (paymentId, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT id, payment_id, invoice_number, issued_at FROM invoices WHERE payment_id = ?',
    [paymentId],
  );
  return rows[0] ?? null;
};

// ----- Hết hạn thanh toán -----

// Điều kiện của một đơn quá hạn: còn pending, thanh toán chưa trả (hoặc không có),
// tạo trước NOW() - holdMinutes phút.
const expiredWhere = (column) => `
  FROM ${orderTableOf(column).table} o
  LEFT JOIN payments pay ON pay.${column} = o.id
  WHERE o.status = 'pending' AND (pay.id IS NULL OR pay.status = 'unpaid')
    AND o.created_at < NOW() - INTERVAL ? MINUTE`;

// Một câu lệnh nhẹ (có index theo status) cho biết loại đơn nào đang có đơn quá hạn.
// Trả danh sách cột, ví dụ ['booking_id']; thường là mảng rỗng.
export const findColumnsWithExpiredOrders = async (holdMinutes, conn = pool) => {
  const columns = PAYMENT_TARGETS.map((target) => target.column);
  const [rows] = await conn.execute(
    `SELECT ${columns
      .map((column, index) => `EXISTS (SELECT 1 ${expiredWhere(column)}) AS c${index}`)
      .join(', ')}`,
    columns.map(() => holdMinutes),
  );
  return columns.filter((_, index) => Boolean(rows[0][`c${index}`]));
};

// Khóa và trả id các đơn quá hạn của một loại, trong transaction đang mở.
export const lockExpiredOrderIds = async (column, holdMinutes, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT o.id ${expiredWhere(column)} ORDER BY o.id FOR UPDATE`,
    [holdMinutes],
  );
  return rows.map((row) => row.id);
};

// ----- Danh sách và chi tiết thanh toán -----

// Tên hiển thị của đơn: "Room 301", tên dịch vụ, "Food order #5", tên tour, tên dịch vụ vận chuyển.
const PAYMENT_FROM = `
  FROM payments pay
  JOIN users u ON u.id = pay.user_id
  LEFT JOIN invoices inv ON inv.payment_id = pay.id
  LEFT JOIN bookings b ON b.id = pay.booking_id
  LEFT JOIN rooms r ON r.id = b.room_id
  LEFT JOIN service_bookings sb ON sb.id = pay.service_booking_id
  LEFT JOIN services s ON s.id = sb.service_id
  LEFT JOIN food_orders fo ON fo.id = pay.food_order_id
  LEFT JOIN tour_bookings tb ON tb.id = pay.tour_booking_id
  LEFT JOIN tours t ON t.id = tb.tour_id
  LEFT JOIN transport_bookings tr ON tr.id = pay.transport_booking_id
  LEFT JOIN services ts ON ts.id = tr.service_id`;

const TARGET_NAME_SQL = {
  booking_id: "CONCAT('Room ', r.room_number)",
  service_booking_id: 's.name',
  food_order_id: "CONCAT('Food order #', fo.id)",
  tour_booking_id: 't.name',
  transport_booking_id: 'ts.name',
};

const caseByTarget = (valueOf) =>
  `CASE ${PAYMENT_TARGETS.map(
    (target) => `WHEN pay.${target.column} IS NOT NULL THEN ${valueOf(target)}`,
  ).join(' ')} END`;

const PAYMENT_SELECT = `
  SELECT pay.id, pay.user_id, pay.amount, pay.method, pay.status, pay.paid_at, pay.created_at,
         inv.invoice_number, inv.issued_at AS invoice_issued_at,
         ${caseByTarget((target) => `'${target.type}'`)} AS target_type,
         COALESCE(${PAYMENT_TARGETS.map((target) => `pay.${target.column}`).join(', ')}) AS target_id,
         ${caseByTarget((target) => TARGET_NAME_SQL[target.column])} AS target_name,
         COALESCE(b.status, sb.status, fo.status, tb.status, tr.status) AS order_status,
         COALESCE(b.created_at, sb.created_at, fo.created_at, tb.created_at, tr.created_at)
           AS order_created_at,
         TIMESTAMPDIFF(
           SECOND,
           COALESCE(b.created_at, sb.created_at, fo.created_at, tb.created_at, tr.created_at),
           NOW()
         ) AS order_age,
         u.full_name AS user_full_name, u.email AS user_email
  ${PAYMENT_FROM}`;

// Thanh toán mới nhất trước; id là thứ tự phụ.
const NEWEST_FIRST = 'pay.created_at DESC, pay.id DESC';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số.
const toPayment = (row) => ({
  id: row.id,
  user_id: row.user_id,
  amount: Number(row.amount),
  method: row.method,
  status: row.status,
  paid_at: row.paid_at,
  created_at: row.created_at,
  invoice_number: row.invoice_number ?? null,
  invoice_issued_at: row.invoice_issued_at ?? null,
  target: { type: row.target_type, id: row.target_id, name: row.target_name },
  order: {
    status: row.order_status,
    created_at: row.order_created_at,
    age_seconds: Number(row.order_age),
  },
  user: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status, type }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('pay.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('pay.status = ?');
    params.push(status);
  }
  if (type !== undefined) {
    // Tên cột lấy từ config theo type đã được validator kiểm tra.
    const target = PAYMENT_TARGETS.find((item) => item.type === type);
    if (target) {
      conditions.push(`pay.${target.column} IS NOT NULL`);
    }
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findPayments = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${PAYMENT_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toPayment);
};

export const countPayments = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM payments pay ${where}`, params);
  return Number(rows[0].total);
};

export const findPaymentById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${PAYMENT_SELECT} WHERE pay.id = ?`, [id]);
  return rows[0] ? toPayment(rows[0]) : null;
};

// Khóa thanh toán (admin hoàn tiền) và đọc trạng thái hiện tại của đơn.
export const lockPaymentById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT pay.id, pay.status,
            COALESCE(b.status, sb.status, fo.status, tb.status, tr.status) AS order_status
     FROM payments pay
     LEFT JOIN bookings b ON b.id = pay.booking_id
     LEFT JOIN service_bookings sb ON sb.id = pay.service_booking_id
     LEFT JOIN food_orders fo ON fo.id = pay.food_order_id
     LEFT JOIN tour_bookings tb ON tb.id = pay.tour_booking_id
     LEFT JOIN transport_bookings tr ON tr.id = pay.transport_booking_id
     WHERE pay.id = ?
     FOR UPDATE`,
    [id],
  );
  return rows[0] ?? null;
};

export const updatePaymentStatus = async (id, status, conn = pool) => {
  await conn.execute('UPDATE payments SET status = ? WHERE id = ?', [status, id]);
};
