// Thanh toán QR giả lập và hóa đơn (mục 11 của docs/api.md, Mục 5 của proposal.md).
// Phương án A: cả 5 loại đơn đều thanh toán bằng QR ngay sau khi đặt.

const DEFAULT_HOLD_MINUTES = 15;

// Đọc PAYMENT_HOLD_MINUTES trong .env (1-1440), chỉ để thử nhanh việc hết hạn; không có thì 15 phút.
const readHoldMinutes = () => {
  const value = Number(process.env.PAYMENT_HOLD_MINUTES);
  return Number.isInteger(value) && value >= 1 && value <= 1440 ? value : DEFAULT_HOLD_MINUTES;
};

// Thời gian giữ đơn chờ thanh toán, tính từ created_at của đơn. Đổi ngày đơn không gia hạn.
export const PAYMENT_HOLD_MINUTES = readHoldMinutes();

// QR được lưu là ví điện tử, nên không cần đổi cấu trúc database.
export const PAYMENT_METHODS = ['e_wallet'];
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

// 5 loại đơn có thanh toán. field: khóa trong body của POST /payments; column: cột trong bảng
// payments; type: tên loại trả về cho frontend (giống config/reviews.js); label: dùng trong thông báo.
// confirmsOrder: thanh toán xong thì đơn tự chuyển confirmed (chỉ đơn đặt phòng);
// các loại khác vẫn pending và chờ admin duyệt.
export const PAYMENT_TARGETS = [
  { field: 'booking_id', column: 'booking_id', type: 'room', label: 'booking', confirmsOrder: true },
  {
    field: 'service_booking_id',
    column: 'service_booking_id',
    type: 'service',
    label: 'service request',
    confirmsOrder: false,
  },
  { field: 'food_order_id', column: 'food_order_id', type: 'food_order', label: 'food order', confirmsOrder: false },
  { field: 'tour_booking_id', column: 'tour_booking_id', type: 'tour', label: 'tour booking', confirmsOrder: false },
  {
    field: 'transport_booking_id',
    column: 'transport_booking_id',
    type: 'transport',
    label: 'transport booking',
    confirmsOrder: false,
  },
];

export const PAYMENT_TARGET_FIELDS = PAYMENT_TARGETS.map((target) => target.field);
export const PAYMENT_TARGET_TYPES = PAYMENT_TARGETS.map((target) => target.type);

export const getPaymentTargetByColumn = (column) =>
  PAYMENT_TARGETS.find((target) => target.column === column);

// Đơn có thể bị hủy vì hết hạn thanh toán ở trạng thái này.
export const PAYABLE_ORDER_STATUS = 'pending';

// Admin chỉ duyệt (confirmed) yêu cầu dịch vụ, đơn đồ ăn, đơn tour và đơn vận chuyển đã thanh toán.
export const ORDER_NOT_PAID = 'This order has not been paid yet.';

// Đơn vị số lượng trên hóa đơn theo loại dịch vụ (số ít; frontend tự thêm số nhiều).
// Thuê xe máy tính theo ngày thuê; các loại còn lại theo quantity của đơn.
export const INVOICE_UNITS = {
  breakfast: 'person',
  buffet: 'person',
  massage: 'person',
  laundry: 'kg',
  housekeeping: 'visit',
  motorbike_rental: 'day',
  airport_pickup: 'car',
  shuttle: 'person',
};
