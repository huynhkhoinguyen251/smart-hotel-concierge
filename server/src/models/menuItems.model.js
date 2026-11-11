import pool from '../config/db.js';
import { placeholders } from './sqlHelpers.js';

const MENU_ITEM_SELECT = `
  SELECT m.id, m.name, m.category, m.price, m.image_url, m.is_available,
         m.created_at, m.updated_at
  FROM menu_items m`;

// MySQL trả DECIMAL dưới dạng chuỗi và BOOLEAN dưới dạng 0/1, nên đổi về số và true/false.
const toMenuItem = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  image_url: row.image_url,
  is_available: Boolean(row.is_available),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const buildFilters = ({ category, is_available }) => {
  const conditions = [];
  const params = [];

  if (category !== undefined) {
    conditions.push('m.category = ?');
    params.push(category);
  }
  if (is_available !== undefined) {
    conditions.push('m.is_available = ?');
    params.push(is_available ? 1 : 0);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findMenuItems = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(`${MENU_ITEM_SELECT} ${where} ORDER BY m.id LIMIT ? OFFSET ?`, [
    ...params,
    limit,
    offset,
  ]);
  return rows.map(toMenuItem);
};

export const countMenuItems = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM menu_items m ${where}`, params);
  return Number(rows[0].total);
};

export const findMenuItemById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${MENU_ITEM_SELECT} WHERE m.id = ?`, [id]);
  return rows[0] ? toMenuItem(rows[0]) : null;
};

// Lấy nhiều món bằng một câu lệnh: WHERE id IN (?, ?, ...).
export const findMenuItemsByIds = async (ids, conn = pool) => {
  if (ids.length === 0) {
    return [];
  }
  const [rows] = await conn.execute(
    `${MENU_ITEM_SELECT} WHERE m.id IN (${placeholders(ids)}) ORDER BY m.id`,
    ids,
  );
  return rows.map(toMenuItem);
};

export const createMenuItem = async (
  { name, category, price, image_url, is_available },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO menu_items (name, category, price, image_url, is_available)
     VALUES (?, ?, ?, ?, ?)`,
    [name, category, price, image_url, is_available ? 1 : 0],
  );
  return result.insertId;
};

// Sửa toàn bộ các cột có thể sửa của món.
export const updateMenuItem = async (
  id,
  { name, category, price, image_url, is_available },
  conn = pool,
) => {
  await conn.execute(
    `UPDATE menu_items
     SET name = ?, category = ?, price = ?, image_url = ?, is_available = ?
     WHERE id = ?`,
    [name, category, price, image_url, is_available ? 1 : 0, id],
  );
};

export const deleteMenuItem = async (id, conn = pool) => {
  await conn.execute('DELETE FROM menu_items WHERE id = ?', [id]);
};

// Món đã nằm trong đơn đồ ăn nào đó thì không xóa được.
export const isMenuItemOrdered = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT EXISTS (SELECT 1 FROM food_order_items WHERE menu_item_id = ?) AS in_use',
    [id],
  );
  return Boolean(rows[0].in_use);
};
