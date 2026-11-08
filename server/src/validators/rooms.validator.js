import { query } from 'express-validator';
import { idParamRule, MAX_INT, paginationRules, queryIntRule } from './common.rules.js';
import { dateRangeRules } from './date.rules.js';

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

export const roomIdValidator = [idParamRule('Invalid room ID')];

export const listRoomsValidator = [
  ...dateRangeRules({ location: 'query', required: false }),
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

export const availabilityValidator = [
  ...roomIdValidator,
  ...dateRangeRules({ location: 'query', required: true }),
];
