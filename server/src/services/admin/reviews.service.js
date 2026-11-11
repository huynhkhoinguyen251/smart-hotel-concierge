import * as reviewsModel from '../../models/reviews.model.js';
import { getPagination } from '../../utils/pagination.js';

// Admin xem tất cả đánh giá, kèm đối tượng được đánh giá và người viết (id, họ tên, email).
export const listReviews = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [reviews, total] = await Promise.all([
    reviewsModel.findReviews({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    reviewsModel.countReviews(filters),
  ]);

  return { reviews, pagination: { page: pagination.page, limit: pagination.limit, total } };
};
