import { body, query } from 'express-validator';
import {
  MAX_SERVICE_QUANTITY,
  MIN_SERVICE_QUANTITY,
  SERVICE_REQUEST_STATUSES,
} from '../config/services.js';
import { isValidDateTimeString } from '../utils/date.js';
import { bodyIntRule, idParamRule, noteRule, paginationRules } from './common.rules.js';

const STATUS_MESSAGE = `Status must be one of: ${SERVICE_REQUEST_STATUSES.join(', ')}`;
const SCHEDULED_AT_MESSAGE =
  'Scheduled time (scheduled_at) must be a valid date and time in YYYY-MM-DD HH:mm format';

// location: query (lọc danh sách) hoặc body (admin đổi trạng thái).
// Bắt buộc, trừ khi gọi .optional().
export const serviceRequestStatusRule = (location) =>
  location('status')
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(SERVICE_REQUEST_STATUSES)
    .withMessage(STATUS_MESSAGE);

export const serviceBookingIdValidator = [idParamRule('Invalid service request ID')];

// Giá không có trong danh sách này, nên giá do client gửi lên bị bỏ qua.
export const createServiceBookingValidator = [
  bodyIntRule('booking_id', 'Booking (booking_id) must be a positive integer'),
  bodyIntRule('service_id', 'Service (service_id) must be a positive integer'),
  body('scheduled_at')
    .isString()
    .withMessage(SCHEDULED_AT_MESSAGE)
    .bail()
    .custom((value) => isValidDateTimeString(value))
    .withMessage(SCHEDULED_AT_MESSAGE),
  bodyIntRule(
    'quantity',
    `Quantity must be an integer from ${MIN_SERVICE_QUANTITY} to ${MAX_SERVICE_QUANTITY}`,
    { min: MIN_SERVICE_QUANTITY, max: MAX_SERVICE_QUANTITY },
  ).optional(),
  noteRule(),
];

export const listMyServiceBookingsValidator = [
  serviceRequestStatusRule(query).optional(),
  ...paginationRules(),
];
