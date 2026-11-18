// Đánh giá (Mục 5 của proposal.md, mục 8 của docs/api.md). Giống server/src/config/reviews.js.
// type: tên loại backend trả trong target.type của GET /reviews.
// field: khóa gửi lên POST /reviews; doneStatus: trạng thái "đã hoàn thành" mới được đánh giá;
// detailPath(id): trang chi tiết đơn của tôi.
export const REVIEW_TYPES = {
  room: {
    label: 'Room stay',
    field: 'booking_id',
    doneStatus: 'checked_out',
    detailPath: (id) => `/my-bookings/${id}`,
  },
  service: {
    label: 'Hotel service',
    field: 'service_booking_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-services/${id}`,
  },
  food_order: {
    label: 'Food order',
    field: 'food_order_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-food-orders/${id}`,
  },
  tour: {
    label: 'Tour',
    field: 'tour_booking_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-trips/tours/${id}`,
  },
  transport: {
    label: 'Transport',
    field: 'transport_booking_id',
    doneStatus: 'completed',
    detailPath: (id) => `/my-trips/transport/${id}`,
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
