import pool from '../config/db.js';

// Số tin nhắn và thời điểm tin nhắn cuối được tính bằng subquery.
// Chỉ lấy id, họ tên và email của khách; không bao giờ lấy password_hash.
const TICKET_SELECT = `
  SELECT st.id, st.user_id, st.subject, st.status, st.created_at, st.updated_at,
         (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = st.id) AS message_count,
         (SELECT MAX(tm.created_at) FROM ticket_messages tm WHERE tm.ticket_id = st.id)
           AS last_message_at,
         u.full_name AS user_full_name, u.email AS user_email
  FROM support_tickets st
  JOIN users u ON u.id = st.user_id`;

// Yêu cầu có tin nhắn hoặc thay đổi gần nhất lên trước; id là thứ tự phụ.
const LATEST_FIRST = 'st.updated_at DESC, st.id DESC';

const toTicket = (row) => ({
  id: row.id,
  subject: row.subject,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
  message_count: Number(row.message_count),
  last_message_at: row.last_message_at,
  guest: { id: row.user_id, full_name: row.user_full_name, email: row.user_email },
});

const buildFilters = ({ user_id, status }) => {
  const conditions = [];
  const params = [];

  if (user_id !== undefined) {
    conditions.push('st.user_id = ?');
    params.push(user_id);
  }
  if (status !== undefined) {
    conditions.push('st.status = ?');
    params.push(status);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

// Dùng conn.query vì execute với tham số LIMIT dễ lỗi trên MySQL 8.
export const findTickets = async ({ limit, offset, ...filters }, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.query(
    `${TICKET_SELECT} ${where} ORDER BY ${LATEST_FIRST} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows.map(toTicket);
};

export const countTickets = async (filters, conn = pool) => {
  const { where, params } = buildFilters(filters);
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total FROM support_tickets st ${where}`,
    params,
  );
  return Number(rows[0].total);
};

export const findTicketById = async (id, conn = pool) => {
  const [rows] = await conn.execute(`${TICKET_SELECT} WHERE st.id = ?`, [id]);
  return rows[0] ? toTicket(rows[0]) : null;
};

// Khóa dòng support_tickets đến hết transaction.
export const lockTicketById = async (id, conn = pool) => {
  const [rows] = await conn.execute(
    'SELECT id, user_id, status FROM support_tickets WHERE id = ? FOR UPDATE',
    [id],
  );
  return rows[0] ?? null;
};

// Yêu cầu mới luôn ở trạng thái open.
export const createTicket = async ({ user_id, subject }, conn = pool) => {
  const [result] = await conn.execute(
    "INSERT INTO support_tickets (user_id, subject, status) VALUES (?, ?, 'open')",
    [user_id, subject],
  );
  return result.insertId;
};

// Gán updated_at rõ ràng, vì ON UPDATE CURRENT_TIMESTAMP chỉ chạy khi có cột thật sự thay đổi.
export const touchTicket = async (id, conn = pool) => {
  await conn.execute('UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    id,
  ]);
};

export const updateTicketStatus = async (id, status, conn = pool) => {
  await conn.execute(
    'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
  );
};
