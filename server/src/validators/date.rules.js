import { body, query } from 'express-validator';
import { MAX_ADVANCE_DAYS, MAX_NIGHTS } from '../config/booking.js';
import { addDays, countNights, formatLocalDate, isValidDateString } from '../utils/date.js';

const LOCATIONS = { query, body };

const dateField = (location, field, label, required) => {
  const chain = LOCATIONS[location](field);
  if (!required) {
    chain.optional();
  }
  const message = `${label} (${field}) must be a valid date in YYYY-MM-DD format`;
  return chain
    .isString()
    .withMessage(message)
    .bail()
    .custom((value) => isValidDateString(value))
    .withMessage(message)
    .bail();
};

// Kiểm tra cặp check_in và check_out, dùng chung cho tìm phòng, kiểm tra phòng trống và đặt phòng.
// location: 'query' hoặc 'body'. required: bắt buộc gửi cả hai ngày.
// bookingLimits: thêm giới hạn đặt trước tối đa và số đêm tối đa của một đơn.
export const dateRangeRules = ({ location = 'query', required, bookingLimits = false }) => {
  const read = (req, field) => req[location]?.[field];

  const checkIn = dateField(location, 'check_in', 'Check-in date', required)
    .custom((value) => value >= formatLocalDate())
    .withMessage('Check-in date cannot be in the past');

  // Chuỗi YYYY-MM-DD so sánh được trực tiếp theo thứ tự ngày.
  const checkOut = dateField(location, 'check_out', 'Check-out date', required)
    .custom((value, { req }) => value > read(req, 'check_in'))
    .withMessage('Check-out date must be after check-in date');

  if (bookingLimits) {
    checkIn
      .bail()
      .custom((value) => value <= addDays(formatLocalDate(), MAX_ADVANCE_DAYS))
      .withMessage(`Check-in date cannot be more than ${MAX_ADVANCE_DAYS} days from today`);
    checkOut
      .bail()
      .custom((value, { req }) => countNights(read(req, 'check_in'), value) <= MAX_NIGHTS)
      .withMessage(`A booking can be at most ${MAX_NIGHTS} nights`);
  }

  return [
    LOCATIONS[location]('check_out')
      .custom((_, { req }) => (read(req, 'check_in') === undefined) === (read(req, 'check_out') === undefined))
      .withMessage('Provide both check_in and check_out, or neither'),
    checkIn,
    checkOut,
  ];
};

// Một ngày YYYY-MM-DD trên query string, không bắt buộc và không giới hạn quá khứ (dùng để lọc).
export const optionalQueryDateRule = (field, label) =>
  dateField('query', field, label, false);
