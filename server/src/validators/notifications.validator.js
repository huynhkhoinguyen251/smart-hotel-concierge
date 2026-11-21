import { query } from 'express-validator';
import { idParamRule, isBooleanLike, paginationRules } from './common.rules.js';

const UNREAD_ONLY_MESSAGE = 'unread_only must be true or false';

export const listMyNotificationsValidator = [
  query('unread_only')
    .optional()
    .isString()
    .withMessage(UNREAD_ONLY_MESSAGE)
    .bail()
    .custom(isBooleanLike)
    .withMessage(UNREAD_ONLY_MESSAGE)
    .bail()
    .toBoolean(true),
  ...paginationRules(),
];

export const notificationIdValidator = [idParamRule('Invalid notification ID')];
