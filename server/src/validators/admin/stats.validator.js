import { MAX_STATS_YEAR, MAX_TOP_LIMIT, MIN_STATS_YEAR } from '../../config/stats.js';
import { queryIntRule } from '../common.rules.js';

export const revenueValidator = [
  queryIntRule('year', `Year must be an integer from ${MIN_STATS_YEAR} to ${MAX_STATS_YEAR}`, {
    min: MIN_STATS_YEAR,
    max: MAX_STATS_YEAR,
  }),
];

// limit không gửi lên thì service dùng giá trị mặc định.
export const topLimitValidator = [
  queryIntRule('limit', `Limit must be an integer from 1 to ${MAX_TOP_LIMIT}`, {
    max: MAX_TOP_LIMIT,
  }),
];
