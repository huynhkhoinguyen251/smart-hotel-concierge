import { body, query } from 'express-validator';
import {
  isBooleanLike,
  isImageUrl,
  isScalar,
  paginationRules,
  PRICE_PATTERN,
} from '../common.rules.js';
import { categoryRule, serviceIdValidator } from '../services.validator.js';

const IS_ACTIVE_MESSAGE = 'is_active must be true or false';

const nameRule = () =>
  body('name')
    .isString()
    .withMessage('Service name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Service name is required')
    .bail()
    .isLength({ max: 150 })
    .withMessage('Service name must be at most 150 characters');

// Không bắt buộc. null hoặc chuỗi rỗng nghĩa là không có mô tả.
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

// Giá được phép bằng 0, ví dụ dịch vụ miễn phí.
const priceRule = () =>
  body('price')
    .custom((value) => isScalar(value) && PRICE_PATTERN.test(String(value)))
    .withMessage('Price must be a number of at least 0 with at most 2 decimal places')
    .bail()
    .toFloat();

// Không bắt buộc. null hoặc chuỗi rỗng nghĩa là không có ảnh.
const imageUrlRule = () =>
  body('image_url')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Image URL must be text')
    .bail()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Image URL must be at most 500 characters')
    .bail()
    .custom((value) => value === '' || isImageUrl(value))
    .withMessage('Image URL must be a valid link starting with http://, https:// or /uploads/')
    .customSanitizer((value) => (value === '' ? null : value));

const isActiveBodyRule = () =>
  body('is_active')
    .optional()
    .custom(isBooleanLike)
    .withMessage(IS_ACTIVE_MESSAGE)
    .bail()
    .toBoolean(true);

const serviceBodyRules = () => [
  nameRule(),
  categoryRule(body),
  descriptionRule(),
  priceRule(),
  imageUrlRule(),
  isActiveBodyRule(),
];

export const listAdminServicesValidator = [
  categoryRule(query).optional(),
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

export const createServiceValidator = serviceBodyRules();

// Sửa toàn bộ: cùng các trường như khi thêm mới.
export const updateServiceValidator = [...serviceIdValidator, ...serviceBodyRules()];

export { serviceIdValidator };
