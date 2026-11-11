import pool from '../config/db.js';

// Đơn đồ ăn không có user_id riêng; chủ đơn là chủ đơn đặt phòng (bookings.user_id).
const FOOD_ORDER_FROM = `
  FROM food_orders fo
  JOIN bookings b ON b.id = fo.booking_id`;

const FOOD_ORDER_SELECT = `
  SELECT fo.id, fo.booking_id, fo.discount_amount, fo.total_price, fo.note, fo.status,
         fo.created_at,
         (SELECT COUNT(*) FROM food_order_items fi WHERE fi.food_order_id = fo.id) AS item_count,
         b.user_id, b.room_id, r.room_number,
         u.full_name AS user_full_name, u.email AS user_email
  ${FOOD_ORDER_FROM}
  JOIN rooms r ON r.id = b.room_id
  JOIN users u ON u.id = b.user_id`;

// Đơn mới nhất trước; id là thứ tự phụ khi created_at bằng nhau.
const NEWEST_FIRST = 'fo.created_at DESC, fo.id DESC';

// MySQL trả DECIMAL dưới dạng chuỗi, nên đổi về số.
const toFoodOrder = (row) => ({
  id: row.id,
  status: row.status,
  discount_amount: Number(row.discount_amount),
  total_price: Number(row.total_price),
  note: row.note,
  created_at: row.created_at,
  item_count: Number(row.item_count),
  booking: { id: row.booking_id, room: { id: row.room_id, room_number: row.room_number } },
  user: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('b.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('fo.status = ?');
    params.push(status);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findFoodOrders = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${FOOD_ORDER_SELECT} ${where} ORDER BY ${NEWEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toFoodOrder);
};

export const countFoodOrders = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total ${FOOD_ORDER_FROM} ${where}`, params);
  return Number(rows[0].total);
};

export const findFoodOrderById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${FOOD_ORDER_SELECT} WHERE fo.id = ?`, [id]);
  return rows[0] ? toFoodOrder(rows[0]) : null;
};

// Chỉ khóa dòng food_orders đến hết transaction. user_id đọc qua subquery nên
// dòng bookings không bị khóa theo, tránh khóa chéo với các thao tác trên đơn đặt phòng.
export const lockFoodOrderById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT fo.id, fo.booking_id, fo.status,
            (SELECT b.user_id FROM bookings b WHERE b.id = fo.booking_id) AS user_id
     FROM food_orders fo WHERE fo.id = ? FOR UPDATE`,
    [id],
  );
  return rows[0] ?? null;
};

// Đơn mới luôn ở trạng thái pending.
export const createFoodOrder = async (
  { booking_id, voucher_id, discount_amount, total_price, note },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO food_orders (booking_id, voucher_id, discount_amount, total_price, note, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [booking_id, voucher_id, discount_amount, total_price, note],
  );
  return result.insertId;
};

export const updateFoodOrderStatus = async (id, status, conn = pool) => {
  await conn.execute('UPDATE food_orders SET status = ? WHERE id = ?', [status, id]);
};
