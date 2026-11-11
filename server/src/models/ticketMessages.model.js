import pool from '../config/db.js';

// Người gửi chỉ có id, họ tên và vai trò; không bao giờ lấy email hay password_hash.
const toTicketMessage = (row) => ({
  id: row.id,
  message: row.message,
  created_at: row.created_at,
  sender: { id: row.sender_id, full_name: row.sender_full_name, role: row.sender_role },
});

// Tin nhắn cũ nhất trước. id tăng dần theo thứ tự gửi, kể cả khi created_at bằng nhau.
export const findMessagesByTicketId = async (ticketId, conn = pool) => {
  const [rows] = await conn.execute(
    `SELECT tm.id, tm.message, tm.created_at, tm.sender_id,
            u.full_name AS sender_full_name, u.role AS sender_role
     FROM ticket_messages tm
     JOIN users u ON u.id = tm.sender_id
     WHERE tm.ticket_id = ?
     ORDER BY tm.id`,
    [ticketId],
  );
  return rows.map(toTicketMessage);
};

export const createMessage = async ({ ticket_id, sender_id, message }, conn = pool) => {
  const [result] = await conn.execute(
    'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)',
    [ticket_id, sender_id, message],
  );
  return result.insertId;
};
