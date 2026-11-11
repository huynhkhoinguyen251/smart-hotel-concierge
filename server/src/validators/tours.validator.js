import { query } from 'express-validator';
import { idParamRule, paginationRules, requiredTextRule } from './common.rules.js';

export const TOUR_LOCATION_MAX = 200;

export const tourIdValidator = [idParamRule('Invalid tour ID')];

// Lọc theo địa điểm, so khớp chính xác (ví dụ Da Nang).
export const locationQueryRule = () =>
  requiredTextRule('location', 'Location', TOUR_LOCATION_MAX, query).optional();

export const listToursValidator = [locationQueryRule(), ...paginationRules()];
