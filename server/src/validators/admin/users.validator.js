import { body, query } from 'express-validator';
import { MAX_USER_SEARCH_LENGTH, USER_ROLES } from '../../config/users.js';
import { idParamRule, isBooleanLike, paginationRules } from '../common.rules.js';

const ROLE_MESSAGE = `Role must be one of: ${USER_ROLES.join(', ')}`;
const IS_ACTIVE_MESSAGE = 'is_active must be true or false';

// location: query (lọc danh sách) hoặc body (đổi vai trò). Bắt buộc, trừ khi gọi .optional().
const roleRule = (location) =>
  location('role')
    .isString()
    .withMessage(ROLE_MESSAGE)
    .bail()
    .isIn(USER_ROLES)
    .withMessage(ROLE_MESSAGE);

export const userIdValidator = [idParamRule('Invalid user ID')];

export const listUsersValidator = [
  // Chuỗi rỗng nghĩa là không tìm.
  query('search')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Search (search) must be text')
    .bail()
    .trim()
    .isLength({ max: MAX_USER_SEARCH_LENGTH })
    .withMessage(`Search (search) must be at most ${MAX_USER_SEARCH_LENGTH} characters`),
  roleRule(query).optional(),
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

export const updateUserStatusValidator = [
  ...userIdValidator,
  body('is_active')
    .custom(isBooleanLike)
    .withMessage(IS_ACTIVE_MESSAGE)
    .bail()
    .toBoolean(true),
];

export const updateUserRoleValidator = [...userIdValidator, roleRule(body)];
