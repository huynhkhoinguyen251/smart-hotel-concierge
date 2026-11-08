import { body, query } from 'express-validator';
import { BOOKING_STATUSES } from '../../config/booking.js';
import { bookingIdValidator, bookingStatusQueryRule } from '../bookings.validator.js';
import { paginationRules, queryIntRule } from '../common.rules.js';
import { optionalQueryDateRule } from '../date.rules.js';

const STATUS_MESSAGE = `Status must be one of: ${BOOKING_STATUSES.join(', ')}`;

export const listAdminBookingsValidator = [
  bookingStatusQueryRule(),
  queryIntRule('room_id', 'Room (room_id) must be a positive integer'),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  optionalQueryDateRule('check_in_from', 'Check-in from date'),
  optionalQueryDateRule('check_in_to', 'Check-in to date')
    .custom(
      (value, { req }) => req.query.check_in_from === undefined || req.query.check_in_from <= value,
    )
    .withMessage('check_in_from cannot be after check_in_to'),
  ...paginationRules(),
];

export const updateBookingStatusValidator = [
  ...bookingIdValidator,
  body('status')
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(BOOKING_STATUSES)
    .withMessage(STATUS_MESSAGE),
];

// Dùng chung với user: kiểm tra :id.
export { bookingIdValidator };
