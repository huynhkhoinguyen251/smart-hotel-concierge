import { getMyReviews } from '../api/reviews.api.js';
import { MY_REVIEWS_PAGE_LIMIT } from '../config/reviews.js';
import useFetch from './useFetch.js';

// Chặn vòng lặp vô hạn nếu dữ liệu phân trang bất thường (50 x 20 = 1000 đánh giá).
const MAX_PAGES = 20;

// Tìm đánh giá của tôi cho một đơn (type: room, service, food_order, tour, transport).
// Cần làm vậy vì API chi tiết của từng đơn không cho biết đơn đã được đánh giá hay chưa,
// và không có API "đánh giá của đơn X". Nên tải GET /reviews (tối đa 50 mỗi trang),
// đi tiếp các trang sau khi còn, rồi so target.type và target.id. Không có thì trả null.
export const findMyReview = async (type, itemId) => {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { reviews, pagination } = await getMyReviews({ page, limit: MY_REVIEWS_PAGE_LIMIT });
    const found = reviews.find(
      (review) => review.target?.type === type && String(review.target?.id) === String(itemId),
    );
    if (found) return found;
    const total = pagination?.total ?? 0;
    if (reviews.length < MY_REVIEWS_PAGE_LIMIT || page * MY_REVIEWS_PAGE_LIMIT >= total) break;
  }
  return null;
};

// Trả { data: đánh giá hoặc null, error, loading, retry } giống useFetch.
export default function useMyReview(type, itemId) {
  return useFetch(() => findMyReview(type, itemId), [type, String(itemId)]);
}
