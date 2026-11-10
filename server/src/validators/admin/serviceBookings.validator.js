import { body, query } from 'express-validator';
import { paginationRules, queryIntRule } from '../common.rules.js';
import {
  serviceBookingIdValidator,
  serviceRequestStatusRule,
} from '../serviceBookings.validator.js';
import { categoryRule } from '../services.validator.js';

export const listAdminServiceBookingsValidator = [
  serviceRequestStatusRule(query).optional(),
  categoryRule(query).optional(),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  ...paginationRules(),
];

export const updateServiceBookingStatusValidator = [
  ...serviceBookingIdValidator,
  serviceRequestStatusRule(body),
];

// Dùng chung với user: kiểm tra :id.
export { serviceBookingIdValidator };
