import { body, query } from 'express-validator';
import {
  descriptionRule,
  imageUrlRule,
  isBooleanLike,
  paginationRules,
  priceRule,
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
