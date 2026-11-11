import { query } from 'express-validator';
import { MAX_RATING, MIN_RATING, REVIEW_TYPES } from '../../config/reviews.js';
import { paginationRules, queryIntRule } from '../common.rules.js';
import { RATING_MESSAGE } from '../reviews.validator.js';

const TYPE_MESSAGE = `Type must be one of: ${REVIEW_TYPES.join(', ')}`;

export const listAdminReviewsValidator = [
  queryIntRule('rating', RATING_MESSAGE, { min: MIN_RATING, max: MAX_RATING }),
  query('type')
    .optional()
    .isString()
    .withMessage(TYPE_MESSAGE)
    .bail()
    .isIn(REVIEW_TYPES)
    .withMessage(TYPE_MESSAGE),
  queryIntRule('user_id', 'User (user_id) must be a positive integer'),
  ...paginationRules(),
];
