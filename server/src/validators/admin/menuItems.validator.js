import { body, query } from 'express-validator';
import {
  isBooleanLike,
  isImageUrl,
  isScalar,
  paginationRules,
  PRICE_PATTERN,
} from '../common.rules.js';
import { menuCategoryRule, menuItemIdValidator } from '../menuItems.validator.js';

const IS_AVAILABLE_MESSAGE = 'is_available must be true or false';

const nameRule = () =>
  body('name')
    .isString()
    .withMessage('Menu item name is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required')
    .bail()
    .isLength({ max: 150 })
    .withMessage('Menu item name must be at most 150 characters');

// Giá được phép bằng 0, ví dụ món tặng kèm.
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

const isAvailableBodyRule = () =>
  body('is_available')
    .optional()
    .custom(isBooleanLike)
    .withMessage(IS_AVAILABLE_MESSAGE)
    .bail()
    .toBoolean(true);

const menuItemBodyRules = () => [
  nameRule(),
  menuCategoryRule(body),
  priceRule(),
  imageUrlRule(),
  isAvailableBodyRule(),
];

export const listAdminMenuItemsValidator = [
  menuCategoryRule(query).optional(),
  query('is_available')
    .optional()
    .isString()
    .withMessage(IS_AVAILABLE_MESSAGE)
    .bail()
    .custom(isBooleanLike)
    .withMessage(IS_AVAILABLE_MESSAGE)
    .bail()
    .toBoolean(true),
  ...paginationRules(),
];

export const createMenuItemValidator = menuItemBodyRules();

// Sửa toàn bộ: cùng các trường như khi thêm mới.
export const updateMenuItemValidator = [...menuItemIdValidator, ...menuItemBodyRules()];

export { menuItemIdValidator };
