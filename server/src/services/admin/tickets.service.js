import { withTransaction } from '../../config/db.js';
import { AUTO_REPLY_TRANSITION, TICKET_TRANSITIONS } from '../../config/tickets.js';
import * as supportTicketsModel from '../../models/supportTickets.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';
import {
  addMessageInTransaction,
  findTicketOr404,
  getTicketDetail,
  TICKET_NOT_FOUND,
  toTicketResponse,
} from '../tickets.service.js';

export const listTickets = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [tickets, total] = await Promise.all([
    supportTicketsModel.findTickets({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    supportTicketsModel.countTickets(filters),
  ]);

  return {
    tickets: tickets.map((ticket) => toTicketResponse(ticket, { withGuest: true })),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getTicket = async (id) =>
  getTicketDetail(await findTicketOr404(id), { withGuest: true });

// Admin trả lời. Yêu cầu đang open thì tự chuyển sang in_progress; luôn cập nhật updated_at.
export const replyToTicket = async (adminId, id, { message }) => {
  await withTransaction(async (conn) => {
    const ticket = await addMessageInTransaction(conn, {
      ticketId: id,
      senderId: adminId,
      message,
    });

    if (ticket.status === AUTO_REPLY_TRANSITION.from) {
      await supportTicketsModel.updateTicketStatus(ticket.id, AUTO_REPLY_TRANSITION.to, conn);
    } else {
      await supportTicketsModel.touchTicket(ticket.id, conn);
    }
  });

  return getTicket(id);
};

// Đổi trạng thái theo luồng một chiều trong config/tickets.js.
export const updateTicketStatus = async (id, status) => {
  await withTransaction(async (conn) => {
    const ticket = await supportTicketsModel.lockTicketById(id, conn);
    if (!ticket) {
      throw new AppError(404, TICKET_NOT_FOUND);
    }
    if (!TICKET_TRANSITIONS[ticket.status]?.includes(status)) {
      throw new AppError(400, `Cannot change status from ${ticket.status} to ${status}`);
    }

    await supportTicketsModel.updateTicketStatus(ticket.id, status, conn);
  });

  return getTicket(id);
};
