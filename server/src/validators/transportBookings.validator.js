import { body, query } from 'express-validator';
import { MAX_TRANSPORT_QUANTITY, MIN_TRANSPORT_QUANTITY } from '../config/tourism.js';
import { isValidDateTimeString } from '../utils/date.js';
import {
  bodyIntRule,
  idParamRule,
  noteRule,
  paginationRules,
  requiredTextRule,
} from './common.rules.js';
import { serviceRequestStatusRule } from './serviceBookings.validator.js';

const FLIGHT_NUMBER_PATTERN = /^[A-Za-z0-9 ]+$/;

const dateTimeMessage = (label, field) =>
  `${label} (${field}) must be a valid date and time in YYYY-MM-DD HH:mm format`;

const dateTimeRule = (field, label) =>
  body(field)
    .isString()
    .withMessage(dateTimeMessage(label, field))
    .bail()
    .custom((value) => isValidDateTimeString(value))
    .withMessage(dateTimeMessage(label, field));

export const transportBookingIdValidator = [idParamRule('Invalid transport booking ID')];

// Validator chỉ kiểm tra định dạng và giới hạn rộng nhất. Quy tắc riêng của từng loại
// (end_at, flight_number, quantity, số ngày thuê) được kiểm tra ở service.
// Giá và vehicle_plate không có trong danh sách này, nên giá trị do client gửi lên bị bỏ qua.
export const createTransportBookingValidator = [
  bodyIntRule('service_id', 'Service (service_id) must be a positive integer'),
  dateTimeRule('start_at', 'Start time'),
  // Không bắt buộc ở đây; chỉ thuê xe máy mới dùng end_at.
  dateTimeRule('end_at', 'End time').optional({ values: 'null' }),
  requiredTextRule('pickup_location', 'Pickup location (pickup_location)', 255),
  requiredTextRule('dropoff_location', 'Drop-off location (dropoff_location)', 255),
  // Không bắt buộc ở đây; đón sân bay mới cần. null hoặc chuỗi rỗng nghĩa là không có.
  body('flight_number')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Flight number (flight_number) must be text')
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Flight number (flight_number) must be at most 20 characters')
    .bail()
    .custom((value) => value === '' || FLIGHT_NUMBER_PATTERN.test(value))
    .withMessage('Flight number (flight_number) can only contain letters, digits and spaces')
    .customSanitizer((value) => (value === '' ? null : value)),
  bodyIntRule(
    'quantity',
    `Quantity must be an integer from ${MIN_TRANSPORT_QUANTITY} to ${MAX_TRANSPORT_QUANTITY}`,
    { min: MIN_TRANSPORT_QUANTITY, max: MAX_TRANSPORT_QUANTITY },
  ).optional(),
  noteRule(),
];

// Trạng thái dùng chung với yêu cầu dịch vụ khách sạn.
export const listMyTransportBookingsValidator = [
  serviceRequestStatusRule(query).optional(),
  ...paginationRules(),
];
