// Hằng số nghiệp vụ của đánh giá, theo Mục 5 của proposal.md và mục 8 của docs/api.md.

// Các loại đơn được đánh giá. Mỗi đánh giá gắn với đúng một loại.
// field: tên trường trong body; column: cột trong bảng reviews; doneStatus: trạng thái
// "đã hoàn thành"; type: tên loại trả về cho frontend; label và doneLabel dùng trong thông báo lỗi.
export const REVIEW_TARGETS = [
  {
    field: 'booking_id',
    column: 'booking_id',
    doneStatus: 'checked_out',
    type: 'room',
    label: 'booking',
    doneLabel: 'checked-out booking',
  },
  {
    field: 'service_booking_id',
    column: 'service_booking_id',
    doneStatus: 'completed',
    type: 'service',
    label: 'service request',
    doneLabel: 'completed service request',
  },
  {
    field: 'food_order_id',
    column: 'food_order_id',
    doneStatus: 'completed',
    type: 'food_order',
    label: 'food order',
    doneLabel: 'completed food order',
  },
  {
    field: 'tour_booking_id',
    column: 'tour_booking_id',
    doneStatus: 'completed',
    type: 'tour',
    label: 'tour booking',
    doneLabel: 'completed tour booking',
  },
  {
    field: 'transport_booking_id',
    column: 'transport_booking_id',
    doneStatus: 'completed',
    type: 'transport',
    label: 'transport booking',
    doneLabel: 'completed transport booking',
  },
];

export const REVIEW_TARGET_FIELDS = REVIEW_TARGETS.map((target) => target.field);
export const REVIEW_TYPES = REVIEW_TARGETS.map((target) => target.type);

// TiDB không kiểm tra CHECK, nên backend tự kiểm tra rating.
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_COMMENT_LENGTH = 1000;
