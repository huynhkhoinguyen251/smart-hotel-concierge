import { query } from 'express-validator';
import { MAX_MESSAGE_LENGTH, MAX_SUBJECT_LENGTH, TICKET_STATUSES } from '../config/tickets.js';
import { idParamRule, paginationRules, requiredTextRule } from './common.rules.js';

const STATUS_MESSAGE = `Status must be one of: ${TICKET_STATUSES.join(', ')}`;

// location: query (lọc danh sách) hoặc body (admin đổi trạng thái).
// Bắt buộc, trừ khi gọi .optional().
export const ticketStatusRule = (location) =>
  location('status')
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(TICKET_STATUSES)
    .withMessage(STATUS_MESSAGE);

export const messageRule = () => requiredTextRule('message', 'Message', MAX_MESSAGE_LENGTH);

export const ticketIdValidator = [idParamRule('Invalid support ticket ID')];

export const createTicketValidator = [
  requiredTextRule('subject', 'Subject', MAX_SUBJECT_LENGTH),
  messageRule(),
];

export const listMyTicketsValidator = [ticketStatusRule(query).optional(), ...paginationRules()];

export const addMessageValidator = [...ticketIdValidator, messageRule()];
