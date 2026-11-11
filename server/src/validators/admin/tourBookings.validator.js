import { body, query } from 'express-validator';
import { paginationRules, queryIntRule } from '../common.rules.js';
import { serviceRequestStatusRule } from '../serviceBookings.validator.js';
import { tourBookingIdValidator } from '../tourBookings.validator.js';

export const listAdminTourBookingsValidator = [
  serviceRequestStatusRule(query).optional(),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  ...paginationRules(),
];

export const updateTourBookingStatusValidator = [
  ...tourBookingIdValidator,
  serviceRequestStatusRule(body),
];

// Dùng chung với user: kiểm tra :id.
export { tourBookingIdValidator };
