import { body, query } from 'express-validator';
import {
  DISCOUNT_TYPES,
  MAX_PERCENT,
  MAX_VOUCHER_CODE_LENGTH,
  MIN_PERCENT,
  normalizeVoucherCode,
  VOUCHER_CODE_PATTERN,
  VOUCHER_STATUSES,
} from '../config/vouchers.js';
import { isValidDateTimeSecondsString } from '../utils/date.js';
import {
  idParamRule,
  isBooleanLike,
  isScalar,
  MAX_INT,
  paginationRules,
  PRICE_PATTERN,
} from './common.rules.js';

const CODE_MESSAGE = `Voucher code must be 1 to ${MAX_VOUCHER_CODE_LENGTH} characters: letters, numbers, "-" or "_"`;
const TYPE_MESSAGE = `Discount type must be one of: ${DISCOUNT_TYPES.join(', ')}`;
const STATUS_MESSAGE = `Status must be one of: ${VOUCHER_STATUSES.join(', ')}`;
const DATE_TIME_MESSAGE = (label) => `${label} must be a date and time in the format YYYY-MM-DD HH:mm:ss`;

const isAmount = (value) => isScalar(value) && PRICE_PATTERN.test(String(value));

// Mã voucher: trim và viết hoa trước khi kiểm tra (không phân biệt hoa thường).
// location: body hoặc query; field: tên trường.
export const voucherCodeRule = (field = 'code', location = body) =>
  location(field)
    .isString()
    .withMessage(CODE_MESSAGE)
    .bail()
    .customSanitizer(normalizeVoucherCode)
    .isLength({ min: 1, max: MAX_VOUCHER_CODE_LENGTH })
    .withMessage(CODE_MESSAGE)
    .bail()
    .matches(VOUCHER_CODE_PATTERN)
    .withMessage(CODE_MESSAGE);

// voucher_code không bắt buộc của POST /bookings và POST /food-orders. Rỗng hoặc null: không dùng voucher.
export const optionalVoucherCodeRule = () => voucherCodeRule('voucher_code').optional({ values: 'falsy' });

// POST /vouchers/validate: { code, amount } (amount: tạm tính của đơn).
export const validateVoucherValidator = [
  voucherCodeRule(),
  body('amount')
    .custom(isAmount)
    .withMessage('Amount must be a number of at least 0 with at most 2 decimal places')
    .bail()
    .toFloat(),
];

// ----- Admin -----

export const voucherIdValidator = [idParamRule('Invalid voucher ID')];

const dateTimeRule = (field, label) =>
  body(field).custom(isValidDateTimeSecondsString).withMessage(DATE_TIME_MESSAGE(label));

const voucherBodyRules = () => [
  voucherCodeRule(),
  body('discount_type').isString().withMessage(TYPE_MESSAGE).bail().isIn(DISCOUNT_TYPES).withMessage(TYPE_MESSAGE),
  // percent: số nguyên 1-100; fixed: số tiền lớn hơn 0.
  body('discount_value')
    .custom((value, { req }) => {
      if (!isAmount(value)) return false;
      const number = Number(value);
      if (req.body.discount_type === 'percent') {
        return Number.isInteger(number) && number >= MIN_PERCENT && number <= MAX_PERCENT;
      }
      return number > 0;
    })
    .withMessage(
      `Discount value must be a whole number from ${MIN_PERCENT} to ${MAX_PERCENT} for percent, or an amount greater than 0 for fixed`,
    )
    .bail()
    .toFloat(),
  body('min_amount')
    .optional()
    .custom(isAmount)
    .withMessage('Minimum amount (min_amount) must be a number of at least 0 with at most 2 decimal places')
    .bail()
    .toFloat(),
  // null: không giới hạn số lần dùng.
  body('max_uses')
    .optional({ values: 'null' })
    .custom((value) => isScalar(value) && /^\d+$/.test(String(value)) && Number(value) >= 1 && Number(value) <= MAX_INT)
    .withMessage('Max uses (max_uses) must be empty (unlimited) or a whole number of at least 1')
    .bail()
    .toInt(),
  dateTimeRule('starts_at', 'Start time (starts_at)'),
  dateTimeRule('ends_at', 'End time (ends_at)')
    .bail()
    // Chuỗi cùng dạng so sánh được trực tiếp theo thời gian.
    .custom((value, { req }) => !isValidDateTimeSecondsString(req.body.starts_at) || value > req.body.starts_at)
    .withMessage('End time (ends_at) must be after the start time (starts_at)'),
  body('is_active')
    .optional()
    .custom(isBooleanLike)
    .withMessage('is_active must be true or false')
    .bail()
    .toBoolean(true),
];

export const createVoucherValidator = voucherBodyRules();
export const updateVoucherValidator = [...voucherIdValidator, ...voucherBodyRules()];

export const listAdminVouchersValidator = [
  query('search')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Search (search) must be text')
    .bail()
    .customSanitizer(normalizeVoucherCode)
    .isLength({ max: MAX_VOUCHER_CODE_LENGTH })
    .withMessage(`Search (search) must be at most ${MAX_VOUCHER_CODE_LENGTH} characters`),
  query('status').optional().isString().withMessage(STATUS_MESSAGE).bail().isIn(VOUCHER_STATUSES).withMessage(STATUS_MESSAGE),
  ...paginationRules(),
];
