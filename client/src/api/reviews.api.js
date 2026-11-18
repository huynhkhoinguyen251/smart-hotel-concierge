import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Mục chung "Food reviews" ở trang thực đơn (đánh giá theo đơn, không theo từng món).
// Trả { summary: { average_rating, review_count }, reviews, pagination }.
export const getFoodReviews = async ({ page, limit } = {}) => {
  const body = await client.get('/food-reviews', { params: cleanParams({ page, limit }) });
  return { ...body.data, pagination: body.pagination };
};

// Đánh giá dịch vụ công khai; gồm cả đánh giá của đơn vận chuyển dùng dịch vụ đó.
export const getServiceReviews = async (id, { page, limit } = {}) => {
  const body = await client.get(`/services/${id}/reviews`, { params: cleanParams({ page, limit }) });
  return { ...body.data, pagination: body.pagination };
};

// Viết đánh giá. target: đúng một khóa, ví dụ { booking_id: 1 } (xem config/reviews.js).
// comment rỗng thì không gửi. Đánh giá không sửa và không xóa được.
export const createReview = async ({ target, rating, comment }) => {
  const body = await client.post('/reviews', {
    ...target,
    rating,
    ...(comment ? { comment } : {}),
  });
  return body.data;
};

// Đánh giá của tôi, mới nhất trước. Mỗi đánh giá có target { type, id, name }.
// Trả { reviews, pagination }.
export const getMyReviews = async ({ page, limit } = {}) => {
  const body = await client.get('/reviews', { params: cleanParams({ page, limit }) });
  return { reviews: body.data, pagination: body.pagination };
};
