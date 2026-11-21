import pool from '../config/db.js';

const NOTIFICATION_COLUMNS = 'id, user_id, type, title, message, link_path, is_read, created_at';

// MySQL lưu BOOLEAN dưới dạng 0 và 1, nên đổi về true và false.
const toNotification = (row) => ({
  id: row.id,
  user_id: row.user_id,
  type: row.type,
  title: row.title,
  message: row.message,
  link_path: row.link_path,
  is_read: Boolean(row.is_read),
  created_at: row.created_at,
});

// Thêm nhiều thông báo bằng một câu INSERT. rows: [{ user_id, type, title, message, link_path }].
// Gọi trong transaction của thay đổi gây ra thông báo, để rollback thì không có thông báo.
export const createNotifications = async (rows, conn = pool) => {
  if (rows.length === 0) {
    return;
  }
  await conn.execute(
    `INSERT INTO notifications (user_id, type, title, message, link_path)
     VALUES ${rows.map(() => '(?, ?, ?, ?, ?)').join(', ')}`,
    rows.flatMap((row) => [row.user_id, row.type, row.title, row.message, row.link_path ?? null]),
  );
};

const buildFilters = ({ user_id, unread_only }) => {
  const conditions = ['user_id = ?'];
  const params = [user_id];
  if (unread_only) {
    conditions.push('is_read = 0');
  }
  return { where: `WHERE ${conditions.join(' AND ')}`, params };
};

// Thông báo mới nhất trước. Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findNotifications = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `SELECT ${NOTIFICATION_COLUMNS} FROM notifications ${where}
     ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toNotification);
};

export const countNotifications = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM notifications ${where}`, params);
  return Number(rows[0].total);
};

export const countUnread = (userId, conn = pool) =>
  countNotifications({ user_id: userId, unread_only: true }, conn);

export const findNotificationById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`SELECT ${NOTIFICATION_COLUMNS} FROM notifications WHERE id = ?`, [
    id,
  ]);
  return rows[0] ? toNotification(rows[0]) : null;
};

export const markNotificationRead = async (id, conn = pool) => {
  await conn.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND is_read = 0', [id]);
};

export const markAllRead = async (userId, conn = pool) => {
  await conn.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [
    userId,
  ]);
};
