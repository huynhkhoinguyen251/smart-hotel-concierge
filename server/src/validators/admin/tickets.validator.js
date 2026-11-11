import { body, query } from 'express-validator';
import { paginationRules, queryIntRule } from '../common.rules.js';
import { addMessageValidator, ticketIdValidator, ticketStatusRule } from '../tickets.validator.js';

export const listAdminTicketsValidator = [
  ticketStatusRule(query).optional(),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  ...paginationRules(),
];

export const updateTicketStatusValidator = [...ticketIdValidator, ticketStatusRule(body)];

// Dùng chung với user: kiểm tra :id và nội dung tin nhắn.
export { addMessageValidator as replyValidator, ticketIdValidator };
