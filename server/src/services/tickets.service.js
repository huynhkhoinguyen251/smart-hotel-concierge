import { withTransaction } from '../config/db.js';
import { CLOSED_TICKET_STATUS } from '../config/tickets.js';
import * as supportTicketsModel from '../models/supportTickets.model.js';
import * as ticketMessagesModel from '../models/ticketMessages.model.js';
import AppError from '../utils/AppError.js';
import { getPagination } from '../utils/pagination.js';

export const TICKET_NOT_FOUND = 'Support ticket not found';
const TICKET_FORBIDDEN = 'You do not have permission to access this support ticket';
const TICKET_CLOSED = 'This support ticket is resolved and cannot receive new messages';

// Dữ liệu trả về của một yêu cầu. Chi tiết có thêm messages; API admin có thêm guest.
export const toTicketResponse = (ticket, { messages, withGuest = false } = {}) => ({
  id: ticket.id,
  subject: ticket.subject,
  status: ticket.status,
  created_at: ticket.created_at,
  updated_at: ticket.updated_at,
  message_count: ticket.message_count,
  last_message_at: ticket.last_message_at,
  ...(withGuest && { guest: ticket.guest }),
  ...(messages && { messages }),
});

export const findTicketOr404 = async (id, conn) => {
  const ticket = await supportTicketsModel.findTicketById(id, conn);
  if (!ticket) {
    throw new AppError(404, TICKET_NOT_FOUND);
  }
  return ticket;
};

// Yêu cầu kèm toàn bộ tin nhắn, dùng cho API chi tiết.
export const getTicketDetail = async (ticket, { withGuest = false } = {}) => {
  const messages = await ticketMessagesModel.findMessagesByTicketId(ticket.id);
  return toTicketResponse(ticket, { messages, withGuest });
};

// Khóa yêu cầu, kiểm tra còn nhận tin nhắn, rồi thêm tin nhắn. Dùng chung cho user và admin.
// checkAccess(ticket) ném lỗi nếu người gửi không được xem yêu cầu này.
export const addMessageInTransaction = async (
  conn,
  { ticketId, senderId, message, checkAccess = () => {} },
) => {
  const ticket = await supportTicketsModel.lockTicketById(ticketId, conn);
  if (!ticket) {
    throw new AppError(404, TICKET_NOT_FOUND);
  }
  checkAccess(ticket);
  if (ticket.status === CLOSED_TICKET_STATUS) {
    throw new AppError(400, TICKET_CLOSED);
  }

  await ticketMessagesModel.createMessage(
    { ticket_id: ticket.id, sender_id: senderId, message },
    conn,
  );
  return ticket;
};

const ensureOwner = (userId) => (ticket) => {
  if (ticket.user_id !== userId) {
    throw new AppError(403, TICKET_FORBIDDEN);
  }
};

export const createTicket = async (userId, { subject, message }) => {
  const id = await withTransaction(async (conn) => {
    const ticketId = await supportTicketsModel.createTicket({ user_id: userId, subject }, conn);
    await ticketMessagesModel.createMessage(
      { ticket_id: ticketId, sender_id: userId, message },
      conn,
    );
    return ticketId;
  });

  return getTicketDetail(await findTicketOr404(id));
};

export const listMyTickets = async (userId, { page, limit, status }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, status };

  const [tickets, total] = await Promise.all([
    supportTicketsModel.findTickets({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    supportTicketsModel.countTickets(filters),
  ]);

  return {
    tickets: tickets.map((ticket) => toTicketResponse(ticket)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyTicket = async (userId, id) => {
  const ticket = await findTicketOr404(id);
  if (ticket.guest.id !== userId) {
    throw new AppError(403, TICKET_FORBIDDEN);
  }
  return getTicketDetail(ticket);
};

// User gửi thêm tin nhắn. Trạng thái không đổi, chỉ cập nhật updated_at.
export const addMyMessage = async (userId, id, { message }) => {
  await withTransaction(async (conn) => {
    const ticket = await addMessageInTransaction(conn, {
      ticketId: id,
      senderId: userId,
      message,
      checkAccess: ensureOwner(userId),
    });
    await supportTicketsModel.touchTicket(ticket.id, conn);
  });

  return getTicketDetail(await findTicketOr404(id));
};
