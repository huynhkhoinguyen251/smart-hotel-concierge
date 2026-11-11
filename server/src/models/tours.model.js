import pool from '../config/db.js';

const TOUR_SELECT = `
  SELECT t.id, t.name, t.description, t.location, t.duration, t.price, t.image_url, t.is_active,
         t.created_at, t.updated_at
  FROM tours t`;

// MySQL trả DECIMAL dưới dạng chuỗi và BOOLEAN dưới dạng 0/1, nên đổi về số và true/false.
const toTour = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  location: row.location,
  duration: row.duration,
  price: Number(row.price),
  image_url: row.image_url,
  is_active: Boolean(row.is_active),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const buildFilters = ({ location, is_active }) => {
  const conditions = [];
  const params = [];

  if (location !== undefined) {
    conditions.push('t.location = ?');
    params.push(location);
  }
  if (is_active !== undefined) {
    conditions.push('t.is_active = ?');
    params.push(is_active ? 1 : 0);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findTours = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(`${TOUR_SELECT} ${where} ORDER BY t.id LIMIT ? OFFSET ?`, [
    ...params,
    limit,
    offset,
  ]);
  return rows.map(toTour);
};

export const countTours = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM tours t ${where}`, params);
  return Number(rows[0].total);
};

export const findTourById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${TOUR_SELECT} WHERE t.id = ?`, [id]);
  return rows[0] ? toTour(rows[0]) : null;
};

export const createTour = async (
  { name, description, location, duration, price, image_url, is_active },
  conn = pool,
) => {
  const [result] = await conn.execute(
    `INSERT INTO tours (name, description, location, duration, price, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description, location, duration, price, image_url, is_active ? 1 : 0],
  );
  return result.insertId;
};

// Sửa toàn bộ các cột có thể sửa của tour.
export const updateTour = async (
  id,
  { name, description, location, duration, price, image_url, is_active },
  conn = pool,
) => {
  await conn.execute(
    `UPDATE tours
     SET name = ?, description = ?, location = ?, duration = ?, price = ?, image_url = ?,
         is_active = ?
     WHERE id = ?`,
    [name, description, location, duration, price, image_url, is_active ? 1 : 0, id],
  );
};

export const deleteTour = async (id, conn = pool) => {
  await conn.execute('DELETE FROM tours WHERE id = ?', [id]);
};

// Tour đã có đơn đặt thì không xóa được.
export const hasTourBookings = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT EXISTS (SELECT 1 FROM tour_bookings WHERE tour_id = ?) AS in_use',
    [id],
  );
  return Boolean(rows[0].in_use);
};
