// Đánh giá (Mục 5 của proposal.md, mục 8 của docs/api.md). Giống server/src/config/reviews.js.
// type: tên loại backend trả trong target.type của GET /reviews.
// field: khóa gửi lên POST /reviews; doneStatus: trạng thái "đã hoàn thành" mới được đánh giá;
// detailPath(id): trang chi tiết đơn của tôi; adminPath(id): trang chi tiết đơn của admin.
const REVIEW_TYPES = {
  room: {
    label: 'Room stay',
    field: 'booking_id',
    doneStatus: 'checked_out',
    detailPath: (id) => `/my-bookings/${id}`,
    adminPath: (id) => `/admin/bookings/${id}`,
  },
  service: {
    label: 'Hotel service',
    field: 'service_booking_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-services/${id}`,
    adminPath: (id) => `/admin/services/${id}`,
  },
  food_order: {
    label: 'Food order',
    field: 'food_order_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-food-orders/${id}`,
    adminPath: (id) => `/admin/food-orders/${id}`,
  },
  tour: {
    label: 'Tour',
    field: 'tour_booking_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-trips/tours/${id}`,
    adminPath: (id) => `/admin/tourism/tours/${id}`,
  },
  transport: {
    label: 'Transport',
    field: 'transport_booking_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-trips/transport/${id}`,
    adminPath: (id) => `/admin/tourism/transport/${id}`,
  },
};

export const getReviewType = (type) => REVIEW_TYPES[type] ?? null;

export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const REVIEW_COMMENT_MAX_LENGTH = 1000;
// GET /reviews cho tối đa 50 mỗi trang.
export const MY_REVIEWS_PAGE_LIMIT = 50;

export const REVIEW_CREATED_MESSAGE = 'Thank you! Your review has been posted.';
export const REVIEW_DUPLICATE_MESSAGE = 'You have already reviewed this.';

// ---- Trang đánh giá của admin ----
// Tab số sao: All, 5★ ... 1★ (giá trị là chuỗi trên địa chỉ trang).
export const REVIEW_RATING_TABS = [
  { value: '', label: 'All' },
  ...[5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating}★` })),
];
export const REVIEW_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(REVIEW_TYPES).map(([value, type]) => ({ value, label: type.label })),
];
// Đánh giá từ 1 đến 2 sao được tô nhẹ để lễ tân liên hệ lại với khách.
export const LOW_RATING_MAX = 2;
export const ADMIN_REVIEWS_PAGE_SIZE = 10;
export const ADMIN_REVIEWS_NOTE =
  'Reviews are written by guests after a completed stay or order and cannot be edited or removed.';
