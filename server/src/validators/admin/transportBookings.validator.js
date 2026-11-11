import { body, query } from 'express-validator';
import { TRANSPORT_CATEGORIES } from '../../config/tourism.js';
import { paginationRules, queryIntRule } from '../common.rules.js';
import { serviceRequestStatusRule } from '../serviceBookings.validator.js';
import { transportBookingIdValidator } from '../transportBookings.validator.js';

const CATEGORY_MESSAGE = `Category must be one of: ${TRANSPORT_CATEGORIES.join(', ')}`;

// Biển số sau khi trim và viết hoa, ví dụ 43B1-567.89.
const VEHICLE_PLATE_PATTERN = /^[A-Z0-9.-]+$/;

export const listAdminTransportBookingsValidator = [
  serviceRequestStatusRule(query).optional(),
  query('category')
    .optional()
    .isString()
    .withMessage(CATEGORY_MESSAGE)
    .bail()
    .isIn(TRANSPORT_CATEGORIES)
    .withMessage(CATEGORY_MESSAGE),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  ...paginationRules(),
];

// vehicle_plate không bắt buộc ở đây. Khi nào được gửi và khi nào bắt buộc do service kiểm tra.
export const updateTransportBookingStatusValidator = [
  ...transportBookingIdValidator,
  serviceRequestStatusRule(body),
  body('vehicle_plate')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Licence plate (vehicle_plate) must be text')
    .bail()
    .trim()
    .toUpperCase()
    .isLength({ max: 20 })
    .withMessage('Licence plate (vehicle_plate) must be at most 20 characters')
    .bail()
    .matches(VEHICLE_PLATE_PATTERN)
    .withMessage('Licence plate (vehicle_plate) can only contain letters, digits, "-" and "."'),
];

// Dùng chung với user: kiểm tra :id.
export { transportBookingIdValidator };
