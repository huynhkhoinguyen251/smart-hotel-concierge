import { PAYMENT_BODY_KEYS, WAITING_FOR_PAYMENT } from '../config/payments.js';

// Đơn đang chờ thanh toán QR: còn pending và thanh toán chưa trả.
export const isAwaitingPayment = (order) =>
  order?.status === 'pending' && order?.payment?.status === 'unpaid';

// 754 giây thành "12:34". Không âm.
export const formatCountdown = (seconds) => {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
};

// Body của POST /payments, ví dụ { method: 'e_wallet', food_order_id: 12 }.
export const toPaymentBody = (type, orderId) => ({ method: 'e_wallet', [PAYMENT_BODY_KEYS[type]]: orderId });

// Chuỗi trong mã QR giả lập. Không phải link ngân hàng thật.
export const toDemoQrText = (type, orderId, payment) =>
  `SHC-DEMO-PAY|${type}|${orderId}|${payment.id}|${payment.amount}`;

// Giờ "HH:mm" từ chuỗi "YYYY-MM-DD HH:mm:ss" của backend, hoặc '' nếu không có.
export const toClockTime = (value) => (typeof value === 'string' ? value.slice(11, 16) : '');

// Admin: nút "Confirm" của yêu cầu dịch vụ, đơn đồ ăn, tour, vận chuyển bị khóa khi chưa thanh toán
// (backend vẫn trả 400 nếu xảy ra). Dùng cho getDisabledReason của AdminStatusActions.
export const getConfirmDisabledReason = (order) => (action) =>
  action.status === 'confirmed' && order.payment?.status !== 'paid' ? WAITING_FOR_PAYMENT : '';

// Admin: ghi chú của đơn đặt phòng pending, ví dụ "Waiting for payment · expires at 18:15".
export const getWaitingForPaymentNote = (booking) => {
  const time = isAwaitingPayment(booking) ? toClockTime(booking.payment.expires_at) : '';
  return time ? `${WAITING_FOR_PAYMENT} · expires at ${time}` : WAITING_FOR_PAYMENT;
};

const UNIT_PLURALS = { person: 'people', kg: 'kg' };

// Số lượng kèm đơn vị trên hóa đơn: 1 night, 3 nights, 2 people, 1 kg...
export const formatUnitQuantity = (quantity, unit) => {
  if (!unit) return String(quantity);
  const plural = UNIT_PLURALS[unit] ?? `${unit}s`;
  return `${quantity} ${Number(quantity) === 1 ? unit : plural}`;
};
