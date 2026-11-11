import { body } from 'express-validator';
import {
  MAX_COMMENT_LENGTH,
  MAX_RATING,
  MIN_RATING,
  REVIEW_TARGET_FIELDS,
} from '../config/reviews.js';
import { bodyIntRule, noteRule, paginationRules } from './common.rules.js';
import { roomIdValidator } from './rooms.validator.js';
import { serviceIdValidator } from './services.validator.js';
import { tourIdValidator } from './tours.validator.js';

export const RATING_MESSAGE = `Rating must be an integer from ${MIN_RATING} to ${MAX_RATING}`;

// null được xem như không gửi.
const isProvided = (value) => value !== undefined && value !== null;

const hasExactlyOneTarget = (value) =>
  REVIEW_TARGET_FIELDS.filter((field) => isProvided(value?.[field])).length === 1;

// TiDB không kiểm tra CHECK, nên phải tự kiểm tra: body có đúng một trường trỏ đến đơn.
// Rule này đứng đầu, để thiếu hoặc thừa đơn luôn báo cùng một thông báo.
export const createReviewValidator = [
  body().custom(hasExactlyOneTarget).withMessage('Provide exactly one item to review'),
  ...REVIEW_TARGET_FIELDS.map((field) =>
    bodyIntRule(field, `${field} must be a positive integer`).optional({ values: 'null' }),
  ),
  bodyIntRule('rating', RATING_MESSAGE, { min: MIN_RATING, max: MAX_RATING }),
  noteRule('comment', 'Comment', MAX_COMMENT_LENGTH),
];

export const listMyReviewsValidator = paginationRules();

export const roomReviewsValidator = [...roomIdValidator, ...paginationRules()];
export const serviceReviewsValidator = [...serviceIdValidator, ...paginationRules()];
export const tourReviewsValidator = [...tourIdValidator, ...paginationRules()];
export const foodReviewsValidator = paginationRules();
