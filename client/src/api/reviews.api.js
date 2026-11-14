import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Mục chung "Food reviews" ở trang thực đơn (đánh giá theo đơn, không theo từng món).
// Trả { summary: { average_rating, review_count }, reviews, pagination }.
export const getFoodReviews = async ({ page, limit } = {}) => {
  const body = await client.get('/food-reviews', { params: cleanParams({ page, limit }) });
  return { ...body.data, pagination: body.pagination };
};
