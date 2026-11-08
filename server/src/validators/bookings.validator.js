import { query } from 'express-validator';
import { BOOKING_STATUSES } from '../config/booking.js';
import { atLeastOneFieldRule, bodyIntRule, idParamRule, paginationRules } from './common.rules.js';
import { dateRangeRules } from './date.rules.js';

const STATUS_MESSAGE = `Status must be one of: ${BOOKING_STATUSES.join(', ')}`;

const guestsRule = () =>
  bodyIntRule('guests', 'Number of guests (guests) must be an integer of at least 1');

export const bookingIdValidator = [idParamRule('Invalid booking ID')];

export const bookingStatusQueryRule = () =>
  query('status')
    .optional()
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(BOOKING_STATUSES)
    .withMessage(STATUS_MESSAGE);

export const createBookingValidator = [
  bodyIntRule('room_id', 'Room (room_id) must be a positive integer'),
  ...dateRangeRules({ location: 'body', required: true, bookingLimits: true }),
  guestsRule(),
];

export const listMyBookingsValidator = [bookingStatusQueryRule(), ...paginationRules()];

// Đổi ngày thì phải gửi cả check_in và check_out; có thể chỉ đổi số khách.
export const updateBookingValidator = [
  ...bookingIdValidator,
  atLeastOneFieldRule(
    ['check_in', 'check_out', 'guests'],
    'Provide check_in and check_out, or guests, to update',
  ),
  ...dateRangeRules({ location: 'body', required: false, bookingLimits: true }),
  guestsRule().optional(),
];
