import { query } from 'express-validator';
import { formatLocalDate, isValidDateString } from '../utils/date.js';
import { idParamRule, MAX_INT, paginationRules, queryIntRule } from './common.rules.js';

const SORT_VALUES = ['price_asc', 'price_desc', 'rating_desc'];

const isIdList = (value) =>
  value
    .split(',')
    .every((part) => /^\d+$/.test(part.trim()) && Number(part) >= 1 && Number(part) <= MAX_INT);

// '1, 2,2' thành [1, 2]: bỏ khoảng trắng và id trùng.
const toIdList = (value) => [...new Set(value.split(',').map((part) => Number(part.trim())))];

const priceRule = (field, message) =>
  query(field)
    .optional()
    .isString()
    .withMessage(message)
    .bail()
    .isFloat({ min: 0 })
    .withMessage(message)
    .bail()
    .toFloat()
    // Chặn các giá trị như 1e400, vì chúng thành Infinity sau khi đổi sang số.
    .custom((value) => Number.isFinite(value))
    .withMessage(message);

const dateField = (field, label, required) => {
  const chain = query(field);
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

// Kiểm tra check_in và check_out, dùng chung cho tìm phòng và kiểm tra phòng trống.
const dateRangeRules = ({ required }) => [
  query('check_out')
    .custom((_, { req }) => (req.query.check_in === undefined) === (req.query.check_out === undefined))
    .withMessage('Provide both check_in and check_out, or neither'),
  dateField('check_in', 'Check-in date', required)
    .custom((value) => value >= formatLocalDate())
    .withMessage('Check-in date cannot be in the past'),
  dateField('check_out', 'Check-out date', required)
    // Chuỗi YYYY-MM-DD so sánh được trực tiếp theo thứ tự ngày.
    .custom((value, { req }) => value > req.query.check_in)
    .withMessage('Check-out date must be after check-in date'),
];

export const roomIdValidator = [idParamRule('Invalid room ID')];

export const listRoomsValidator = [
  ...dateRangeRules({ required: false }),
  queryIntRule('guests', 'Number of guests (guests) must be an integer of at least 1'),
  queryIntRule('room_type_id', 'Room type (room_type_id) must be a positive integer'),
  priceRule('min_price', 'Minimum price (min_price) must be a non-negative number'),
  priceRule('max_price', 'Maximum price (max_price) must be a non-negative number')
    .bail()
    .custom(
      (value, { req }) =>
        req.query.min_price === undefined || Number(req.query.min_price) <= value,
    )
    .withMessage('Minimum price cannot be greater than maximum price'),
  query('amenity_ids')
    .optional()
    .isString()
    .withMessage('Amenities (amenity_ids) must be a list of IDs, for example 1,2,3')
    .bail()
    .custom(isIdList)
    .withMessage('Amenities (amenity_ids) must be a list of IDs, for example 1,2,3')
    .bail()
    .customSanitizer(toIdList),
  query('sort')
    .optional()
    .isString()
    .withMessage(`Sort order (sort) must be one of: ${SORT_VALUES.join(', ')}`)
    .bail()
    .isIn(SORT_VALUES)
    .withMessage(`Sort order (sort) must be one of: ${SORT_VALUES.join(', ')}`),
  ...paginationRules(),
];

export const availabilityValidator = [...roomIdValidator, ...dateRangeRules({ required: true })];
