import { matchedData } from 'express-validator';
import * as ticketsService from '../services/tickets.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user luôn lấy từ token, không lấy từ body.

export const createTicket = async (req, res) => {
  const ticket = await ticketsService.createTicket(req.user.id, matchedData(req));
  sendSuccess(res, ticket, 'Support ticket created successfully', 201);
};

export const getMyTickets = async (req, res) => {
  const { tickets, pagination } = await ticketsService.listMyTickets(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, tickets, pagination);
};

export const getMyTicket = async (req, res) => {
  const { id } = matchedData(req);
  const ticket = await ticketsService.getMyTicket(req.user.id, id);
  sendSuccess(res, ticket, 'Support ticket retrieved successfully');
};

export const addMyMessage = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const ticket = await ticketsService.addMyMessage(req.user.id, id, data);
  sendSuccess(res, ticket, 'Message sent successfully', 201);
};
