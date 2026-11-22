import pool from '../config/db.js';
import { VOUCHER_ORDER_TABLES } from '../config/vouchers.js';

// Trạng thái của voucher, tính bằng giờ của database (NOW() theo múi giờ +07:00 của phiên kết nối).
// Thứ tự ưu tiên: inactive, scheduled, expired, used_up, active.
const STATUS_SQL = `CASE
    WHEN v.is_active = 0 THEN 'inactive'
    WHEN NOW() < v.starts_at THEN 'scheduled'
    WHEN NOW() > v.ends_at THEN 'expired'
    WHEN v.max_uses IS NOT NULL AND v.used_count >= v.max_uses THEN 'used_up'
    ELSE 'active'
  END`;

const VOUCHER_SELECT = `
  SELECT v.id, v.code, v.discount_type, v.discount_value, v.min_amount, v.max_uses, v.used_count,
         v.starts_at, v.ends_at, v.is_active, v.created_at, v.updated_at,
         ${STATUS_SQL} AS status
  FROM vouchers v`;

// MySQL trả DECIMAL dưới dạng chuỗi và BOOLEAN dưới dạng 0/1, nên đổi về số và true/false.
const toVoucher = (row) => ({
  id: row.id,
  code: row.code,
  discount_type: row.discount_type,
  discount_value: Number(row.discount_value),
  min_amount: Number(row.min_amount),
  max_uses: row.max_uses === null ? null : Number(row.max_uses),
  used_count: Number(row.used_count),
  starts_at: row.starts_at,
  ends_at: row.ends_at,
  is_active: Boolean(row.is_active),
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// ----- Voucher gắn với đơn -----

// Cột và JOIN để thêm voucher vào câu SELECT của đơn đặt phòng hoặc đơn đồ ăn.
export const voucherSummarySql = (orderAlias) => ({
  columns: `ov.id AS voucher_ref_id, ov.code AS voucher_code, ov.discount_type AS voucher_discount_type,
         ov.discount_value AS voucher_discount_value`,
  joins: `LEFT JOIN vouchers ov ON ov.id = ${orderAlias}.voucher_id`,
});

export const toVoucherSummaryRow = (row) =>
  row.voucher_ref_id
    ? {
        id: row.voucher_ref_id,
        code: row.voucher_code,
        discount_type: row.voucher_discount_type,
        discount_value: Number(row.voucher_discount_value),
      }
    : null;

// ----- Đọc và khóa -----

export const findVoucherByCode = async (code, conn = pool) => {
  const [rows] = await conn.execute(`${VOUCHER_SELECT} WHERE v.code = ?`, [code]);
  return rows[0] ? toVoucher(rows[0]) : null;
};

// Khóa voucher đến hết transaction, để hai đơn cùng lúc không dùng quá max_uses.
export const lockVoucherByCode = async (code, conn = pool) => {
  const [rows] = await conn.execute(`${VOUCHER_SELECT} WHERE v.code = ? FOR UPDATE`, [code]);
  return rows[0] ? toVoucher(rows[0]) : null;
};

export const findVoucherById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${VOUCHER_SELECT} WHERE v.id = ?`, [id]);
  return rows[0] ? toVoucher(rows[0]) : null;
};

export const lockVoucherById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${VOUCHER_SELECT} WHERE v.id = ? FOR UPDATE`, [id]);
  return rows[0] ? toVoucher(rows[0]) : null;
};

// ----- Số lần dùng -----

export const incrementUsedCount = async (id, conn = pool) => {
  await conn.execute('UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?', [id]);
};

// Trả lại một lần dùng khi đơn có voucher bị hủy (không bao giờ dưới 0).
// kind: 'room' hoặc 'food_order'; đơn không có voucher thì không đổi gì.
export const releaseVoucherOfOrder = async (kind, orderId, conn = pool) => {
  const table = VOUCHER_ORDER_TABLES[kind];
  if (!table) {
    throw new Error(`Unknown voucher order kind: ${kind}`);
  }
  await conn.execute(
    `UPDATE vouchers v
     JOIN ${table} o ON o.voucher_id = v.id
     SET v.used_count = GREATEST(v.used_count - 1, 0)
     WHERE o.id = ?`,
    [orderId],
  );
};

// ----- Admin -----

const buildFilters = ({ search, status }) => {
  const conditions = [];
  const params = [];
  if (search) {
    // Mã chỉ gồm A-Z, 0-9, "-" và "_" (validator đã kiểm tra); "_" là ký tự đại diện của LIKE nên cần thoát.
    conditions.push("v.code LIKE ? ESCAPE '!'");
    params.push(`%${search.replace(/[!%_]/g, (char) => `!${char}`)}%`);
  }
  if (status !== undefined) {
    conditions.push(`(${STATUS_SQL}) = ?`);
    params.push(status);
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Mới nhất trước. Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findVouchers = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${VOUCHER_SELECT} ${where} ORDER BY v.created_at DESC, v.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toVoucher);
};

export const countVouchers = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM vouchers v ${where}`, params);
  return Number(rows[0].total);
};

export const createVoucher = async (
  { code, discount_type, discount_value, min_amount, max_uses, starts_at, ends_at, is_active },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO vouchers
       (code, discount_type, discount_value, min_amount, max_uses, used_count, starts_at, ends_at, is_active)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [code, discount_type, discount_value, min_amount, max_uses, starts_at, ends_at, is_active ? 1 : 0],
  );
  return result.insertId;
};

// Sửa toàn bộ; used_count không đổi ở đây.
export const updateVoucher = async (
  id,
  { code, discount_type, discount_value, min_amount, max_uses, starts_at, ends_at, is_active },
  conn = pool,
) => {
  await conn.execute(
    `UPDATE vouchers
     SET code = ?, discount_type = ?, discount_value = ?, min_amount = ?, max_uses = ?,
         starts_at = ?, ends_at = ?, is_active = ?
     WHERE id = ?`,
    [code, discount_type, discount_value, min_amount, max_uses, starts_at, ends_at, is_active ? 1 : 0, id],
  );
};

export const deleteVoucher = async (id, conn = pool) => {
  await conn.execute('DELETE FROM vouchers WHERE id = ?', [id]);
};

// Voucher đã gắn với đơn đặt phòng hoặc đơn đồ ăn nào thì không xóa được.
export const isVoucherUsed = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT EXISTS (SELECT 1 FROM bookings WHERE voucher_id = ?)
         OR EXISTS (SELECT 1 FROM food_orders WHERE voucher_id = ?) AS in_use`,
    [id, id],
  );
  return Boolean(rows[0].in_use);
};
