import { matchedData } from 'express-validator';
import * as ticketsService from '../../services/admin/tickets.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getTickets = async (req, res) => {
  const { tickets, pagination } = await ticketsService.listTickets(matchedData(req));
  sendPaginated(res, tickets, pagination);
};

export const getTicket = async (req, res) => {
  const { id } = matchedData(req);
  const ticket = await ticketsService.getTicket(id);
  sendSuccess(res, ticket, 'Support ticket retrieved successfully');
};

// Người trả lời là admin trong token.
export const replyToTicket = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const ticket = await ticketsService.replyToTicket(req.user.id, id, data);
  sendSuccess(res, ticket, 'Reply sent successfully', 201);
};

export const updateTicketStatus = async (req, res) => {
  const { id, status } = matchedData(req);
  const ticket = await ticketsService.updateTicketStatus(id, status);
  sendSuccess(res, ticket, 'Support ticket status updated successfully');
};
