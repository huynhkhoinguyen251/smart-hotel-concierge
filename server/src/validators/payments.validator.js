import { body, query } from 'express-validator';
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_TARGET_FIELDS,
  PAYMENT_TARGET_TYPES,
} from '../config/payments.js';
import { bodyIntRule, idParamRule, paginationRules } from './common.rules.js';

const METHOD_MESSAGE = `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`;
const STATUS_MESSAGE = `Status must be one of: ${PAYMENT_STATUSES.join(', ')}`;
const TYPE_MESSAGE = `Type must be one of: ${PAYMENT_TARGET_TYPES.join(', ')}`;

// null được xem như không gửi.
const isProvided = (value) => value !== undefined && value !== null;

const hasExactlyOneTarget = (value) =>
  PAYMENT_TARGET_FIELDS.filter((field) => isProvided(value?.[field])).length === 1;

// TiDB không kiểm tra CHECK, nên phải tự kiểm tra: body có đúng một trường trỏ đến đơn.
// Số tiền không nhận từ body; backend lấy từ thanh toán đã tạo cùng đơn.
export const createPaymentValidator = [
  body().custom(hasExactlyOneTarget).withMessage('Provide exactly one order to pay for'),
  ...PAYMENT_TARGET_FIELDS.map((field) =>
    bodyIntRule(field, `${field} must be a positive integer`).optional({ values: 'null' }),
  ),
  body('method')
    .isString()
    .withMessage(METHOD_MESSAGE)
    .bail()
    .isIn(PAYMENT_METHODS)
    .withMessage(METHOD_MESSAGE),
];

export const paymentIdValidator = [idParamRule('Invalid payment ID')];

export const listMyPaymentsValidator = paginationRules();

export const listAdminPaymentsValidator = [
  query('status')
    .optional()
    .isString()
    .withMessage(STATUS_MESSAGE)
    .bail()
    .isIn(PAYMENT_STATUSES)
    .withMessage(STATUS_MESSAGE),
  query('type')
    .optional()
    .isString()
    .withMessage(TYPE_MESSAGE)
    .bail()
    .isIn(PAYMENT_TARGET_TYPES)
    .withMessage(TYPE_MESSAGE),
  ...paginationRules(),
];
