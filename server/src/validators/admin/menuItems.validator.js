import { body, query } from 'express-validator';
import { imageUrlRule, isBooleanLike, paginationRules, priceRule } from '../common.rules.js';
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
