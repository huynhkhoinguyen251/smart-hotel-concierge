import { makeAdminResource } from './adminResource.js';

// Đánh giá (admin), chỉ đọc: không có API xóa hoặc ẩn.
// Lọc bằng rating (1-5), type (room, service, food_order, tour, transport). Mới nhất trước.
// Mỗi đánh giá: { id, rating, comment, created_at, target { type, id, name }, reviewer { id, full_name, email } }.
const resource = makeAdminResource('/admin/reviews', 'reviews');

export const getAdminReviews = resource.list;
