// Thanh toán QR giả lập và hóa đơn (mục 11 của docs/api.md, Phương án A).
// Nhãn và đường dẫn chi tiết của từng loại đơn dùng lại REVIEW_TYPES (getReviewType) trong config/reviews.js.

// Chỉ để hiển thị; backend quyết định hạn thật (server/src/config/payments.js).
export const PAYMENT_HOLD_MINUTES = 15;

export const PAYMENT_METHOD_LABELS = { e_wallet: 'E-wallet (QR)' };
export const getPaymentMethodLabel = (method) => PAYMENT_METHOD_LABELS[method] ?? method;

// Khóa trong body của POST /payments theo loại đơn.
export const PAYMENT_BODY_KEYS = {
  room: 'booking_id',
  service: 'service_booking_id',
  food_order: 'food_order_id',
  tour: 'tour_booking_id',
  transport: 'transport_booking_id',
};

export const PAYMENT_STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
];

// Dưới 2 phút thì đồng hồ đếm ngược chuyển màu đỏ.
export const COUNTDOWN_WARNING_SECONDS = 120;

export const PAYMENT_EXPIRED_MESSAGE = 'The payment time has expired. This order will be cancelled.';
export const ROOM_PAID_MESSAGE = 'Payment received. Your booking is confirmed.';
export const REQUEST_PAID_MESSAGE = 'Payment received. Reception will confirm your request soon.';
export const WAITING_FOR_PAYMENT = 'Waiting for payment';
export const DEMO_QR_NOTE = 'Demo only. No real money is charged.';
export const REFUND_CONFIRM_MESSAGE = 'Mark this payment as refunded? No real money is moved.';

export const MY_PAYMENTS_PAGE_SIZE = 10;
export const ADMIN_PAYMENTS_PAGE_SIZE = 10;

// Tên và địa chỉ in trên hóa đơn (dữ liệu demo).
export const HOTEL_NAME = 'Smart Hotel Concierge';
export const HOTEL_ADDRESS = '12 Bach Dang Street, Hai Chau, Da Nang, Vietnam';
