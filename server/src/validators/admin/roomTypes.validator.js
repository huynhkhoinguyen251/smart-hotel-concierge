import { body } from 'express-validator';
import {
  atLeastOneFieldRule,
  bodyIntRule,
  idParamRule,
  MAX_INT,
  PRICE_PATTERN,
} from '../common.rules.js';

const AMENITY_IDS_MESSAGE = 'Amenities (amenity_ids) must be an array of amenity IDs';

const nameRule = () =>
  body('name')
    .isString()
    .withMessage('Room type name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Room type name is required')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Room type name must be at most 100 characters');

// Không bắt buộc. Gửi null hoặc chuỗi rỗng để xóa mô tả.
const descriptionRule = () =>
  body('description')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Description must be text')
    .bail()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be at most 5000 characters')
    .customSanitizer((value) => (value === '' ? null : value));

const priceRule = () =>
  body('price_per_night')
    .custom(
      (value) =>
        (typeof value === 'number' || typeof value === 'string') &&
        PRICE_PATTERN.test(String(value)) &&
        Number(value) > 0,
    )
    .withMessage('Price per night must be a number greater than 0 with at most 2 decimal places')
    .bail()
    .toFloat();

const capacityRule = () =>
  bodyIntRule('capacity', 'Capacity must be an integer from 1 to 20', { min: 1, max: 20 });

// Mảng id, có thể rỗng. Bỏ id trùng.
const amenityIdsRule = () =>
  body('amenity_ids')
    .optional()
    .isArray({ max: 100 })
    .withMessage(AMENITY_IDS_MESSAGE)
    .bail()
    .custom((ids) =>
      ids.every(
        (id) =>
          (typeof id === 'number' || typeof id === 'string') &&
          /^\d+$/.test(String(id)) &&
          Number(id) >= 1 &&
          Number(id) <= MAX_INT,
      ),
    )
    .withMessage(AMENITY_IDS_MESSAGE)
    .bail()
    .customSanitizer((ids) => [...new Set(ids.map(Number))]);

export const roomTypeIdValidator = [idParamRule('Invalid room type ID')];

export const createRoomTypeValidator = [
  nameRule(),
  descriptionRule(),
  priceRule(),
  capacityRule(),
  amenityIdsRule(),
];

export const updateRoomTypeValidator = [
  ...roomTypeIdValidator,
  atLeastOneFieldRule(
    ['name', 'description', 'price_per_night', 'capacity', 'amenity_ids'],
    'Provide at least one field to update: name, description, price_per_night, capacity or amenity_ids',
  ),
  nameRule().optional(),
  descriptionRule(),
  priceRule().optional(),
  capacityRule().optional(),
  amenityIdsRule(),
];
