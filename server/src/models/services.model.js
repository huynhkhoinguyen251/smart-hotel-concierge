import pool from '../config/db.js';

const SERVICE_SELECT = `
  SELECT s.id, s.name, s.category, s.description, s.price, s.image_url, s.is_active,
         s.created_at, s.updated_at
  FROM services s`;

// MySQL trả DECIMAL dưới dạng chuỗi và BOOLEAN dưới dạng 0/1, nên đổi về số và true/false.
const toService = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  description: row.description,
  price: Number(row.price),
  image_url: row.image_url,
  is_active: Boolean(row.is_active),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const buildFilters = ({ category, is_active }) => {
  const conditions = [];
  const params = [];

  if (category !== undefined) {
    conditions.push('s.category = ?');
    params.push(category);
  }
  if (is_active !== undefined) {
    conditions.push('s.is_active = ?');
    params.push(is_active ? 1 : 0);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findServices = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(`${SERVICE_SELECT} ${where} ORDER BY s.id LIMIT ? OFFSET ?`, [
    ...params,
    limit,
    offset,
  ]);
  return rows.map(toService);
};

export const countServices = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM services s ${where}`, params);
  return Number(rows[0].total);
};

export const findServiceById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${SERVICE_SELECT} WHERE s.id = ?`, [id]);
  return rows[0] ? toService(rows[0]) : null;
};

export const createService = async (
  { name, category, description, price, image_url, is_active },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO services (name, category, description, price, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, description, price, image_url, is_active ? 1 : 0],
  );
  return result.insertId;
};

// Sửa toàn bộ các cột có thể sửa của dịch vụ.
export const updateService = async (
  id,
  { name, category, description, price, image_url, is_active },
  conn = pool,
) => {
  await conn.execute(
    `UPDATE services
     SET name = ?, category = ?, description = ?, price = ?, image_url = ?, is_active = ?
     WHERE id = ?`,
    [name, category, description, price, image_url, is_active ? 1 : 0, id],
  );
};

export const deleteService = async (id, conn = pool) => {
  await conn.execute('DELETE FROM services WHERE id = ?', [id]);
};

// Dịch vụ đã có yêu cầu dịch vụ khách sạn hoặc đơn vận chuyển thì không xóa được.
export const hasServiceRequests = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT EXISTS (SELECT 1 FROM service_bookings WHERE service_id = ?)
         OR EXISTS (SELECT 1 FROM transport_bookings WHERE service_id = ?) AS in_use`,
    [id, id],
  );
  return Boolean(rows[0].in_use);
};
