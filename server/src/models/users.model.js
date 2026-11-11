import pool from '../config/db.js';
import { escapeLike, LIKE_ESCAPE } from './sqlHelpers.js';

// Chỉ liệt kê các cột được phép trả về, nên password_hash không bao giờ lọt ra ngoài.
const USER_COLUMNS = 'id, full_name, email, phone, role, is_active, created_at, updated_at';

// MySQL lưu BOOLEAN dưới dạng 0 và 1, nên đổi về true và false trước khi trả về.
const toUser = (row) => ({ ...row, is_active: Boolean(row.is_active) });

export const findUserById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [id]);
  return rows[0] ? toUser(rows[0]) : null;
};

// Có password_hash, chỉ dùng để kiểm tra mật khẩu khi đăng nhập.
export const findUserWithPasswordByEmail = async (email, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`,
    [email],
  );
  return rows[0] ? toUser(rows[0]) : null;
};

// Chỉ dùng để kiểm tra email đã có người dùng chưa.
export const findUserIdByEmail = async (email, conn = pool) => {
  const [rows] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
  return rows[0]?.id ?? null;
};

// Chỉ dùng để kiểm tra mật khẩu hiện tại khi đổi mật khẩu.
export const findPasswordHashById = async (id, conn = pool) => {
  const [rows] = await conn.execute('SELECT password_hash FROM users WHERE id = ?', [id]);
  return rows[0]?.password_hash ?? null;
};

// Luôn tạo vai trò user. Số điện thoại rỗng được lưu thành NULL.
export const createUser = async ({ full_name, email, password_hash, phone }, conn = pool) => {
  const [result] = await conn.execute(
    `INSERT INTO users (full_name, email, password_hash, phone, role)
     VALUES (?, ?, ?, ?, 'user')`,
    [full_name, email, password_hash, phone || null],
  );
  return result.insertId;
};

// Chỉ cập nhật các trường được gửi lên. Tên cột cố định trong code, giá trị đi qua tham số.
export const updateUserProfile = async (id, { full_name, phone }, conn = pool) => {
  const fields = [];
  const values = [];

  if (full_name !== undefined) {
    fields.push('full_name = ?');
    values.push(full_name);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone || null);
  }

  await conn.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
};

export const updateUserPassword = async (id, passwordHash, conn = pool) => {
  await conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
};

// ----- Quản lý người dùng (admin) -----

// search tìm trong họ tên, email và số điện thoại. %, _ do người dùng nhập là ký tự thường.
const buildFilters = ({ search, role, is_active }) => {
  const conditions = [];
  const params = [];

  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    conditions.push(
      `(full_name LIKE ? ESCAPE '${LIKE_ESCAPE}' OR email LIKE ? ESCAPE '${LIKE_ESCAPE}'
        OR phone LIKE ? ESCAPE '${LIKE_ESCAPE}')`,
    );
    params.push(pattern, pattern, pattern);
  }
  if (role !== undefined) {
    conditions.push('role = ?');
    params.push(role);
  }
  if (is_active !== undefined) {
    conditions.push('is_active = ?');
    params.push(is_active ? 1 : 0);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Người mới nhất trước. Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findUsers = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `SELECT ${USER_COLUMNS} FROM users ${where}
     ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toUser);
};

export const countUsers = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(`SELECT COUNT(*) AS total FROM users ${where}`, params);
  return Number(rows[0].total);
};

export const updateUserStatus = async (id, isActive, conn = pool) => {
  await conn.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
};

export const updateUserRole = async (id, role, conn = pool) => {
  await conn.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
};
