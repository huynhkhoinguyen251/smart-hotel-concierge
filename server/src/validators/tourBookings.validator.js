import { body, query } from 'express-validator';
import { MAX_PARTICIPANTS, MIN_PARTICIPANTS } from '../config/tourism.js';
import { isValidDateString } from '../utils/date.js';
import { bodyIntRule, idParamRule, noteRule, paginationRules } from './common.rules.js';
import { serviceRequestStatusRule } from './serviceBookings.validator.js';

const TOUR_DATE_MESSAGE = 'Tour date (tour_date) must be a valid date in YYYY-MM-DD format';

export const tourBookingIdValidator = [idParamRule('Invalid tour booking ID')];

// Giá không có trong danh sách này, nên giá do client gửi lên bị bỏ qua.
// Ngày tour so với hôm nay được kiểm tra ở service.
export const createTourBookingValidator = [
  bodyIntRule('tour_id', 'Tour (tour_id) must be a positive integer'),
  body('tour_date')
    .isString()
    .withMessage(TOUR_DATE_MESSAGE)
    .bail()
    .custom((value) => isValidDateString(value))
    .withMessage(TOUR_DATE_MESSAGE),
  bodyIntRule(
    'participants',
    `Participants must be an integer from ${MIN_PARTICIPANTS} to ${MAX_PARTICIPANTS}`,
    { min: MIN_PARTICIPANTS, max: MAX_PARTICIPANTS },
  ).optional(),
  noteRule(),
];

// Trạng thái dùng chung với yêu cầu dịch vụ khách sạn.
export const listMyTourBookingsValidator = [
  serviceRequestStatusRule(query).optional(),
  ...paginationRules(),
];
