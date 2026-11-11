import { body, query } from 'express-validator';
import {
  descriptionRule,
  imageUrlRule,
  isBooleanLike,
  paginationRules,
  priceRule,
  requiredTextRule,
} from '../common.rules.js';
import { locationQueryRule, TOUR_LOCATION_MAX, tourIdValidator } from '../tours.validator.js';

const IS_ACTIVE_MESSAGE = 'is_active must be true or false';

const isActiveBodyRule = () =>
  body('is_active')
    .optional()
    .custom(isBooleanLike)
    .withMessage(IS_ACTIVE_MESSAGE)
    .bail()
    .toBoolean(true);

const tourBodyRules = () => [
  requiredTextRule('name', 'Tour name', 150),
  descriptionRule(),
  requiredTextRule('location', 'Location', TOUR_LOCATION_MAX),
  // Thời lượng dạng chữ, ví dụ "Half day" hoặc "1 day".
  requiredTextRule('duration', 'Duration', 50),
  priceRule(),
  imageUrlRule(),
  isActiveBodyRule(),
];

export const listAdminToursValidator = [
  locationQueryRule(),
  query('is_active')
    .optional()
    .isString()
    .withMessage(IS_ACTIVE_MESSAGE)
    .bail()
    .custom(isBooleanLike)
    .withMessage(IS_ACTIVE_MESSAGE)
    .bail()
    .toBoolean(true),
  ...paginationRules(),
];

export const createTourValidator = tourBodyRules();

// Sửa toàn bộ: cùng các trường như khi thêm mới.
export const updateTourValidator = [...tourIdValidator, ...tourBodyRules()];

export { tourIdValidator };
