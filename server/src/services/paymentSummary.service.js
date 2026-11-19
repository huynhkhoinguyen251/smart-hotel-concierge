import { PAYABLE_ORDER_STATUS, PAYMENT_HOLD_MINUTES } from '../config/payments.js';
import { addMinutesToDateTime } from '../utils/date.js';

// Đơn đang chờ thanh toán: còn pending và thanh toán chưa trả.
export const isAwaitingPayment = (orderStatus, payment) =>
  orderStatus === PAYABLE_ORDER_STATUS && payment?.status === 'unpaid';

// Object `payment` gắn vào dữ liệu trả về của mọi loại đơn (mục 11 của docs/api.md).
// payment: kết quả toPaymentSummaryRow của model (null với đơn cũ chưa có thanh toán).
// expires_at và seconds_left chỉ có khi đơn còn chờ thanh toán; seconds_left tính từ số giây
// database đếm được từ lúc tạo đơn, nên không phụ thuộc đồng hồ của server Node.
export const toPaymentSummary = (payment, order) => {
  if (!payment) {
    return null;
  }
  const waiting = isAwaitingPayment(order.status, payment);
  return {
    id: payment.id,
    status: payment.status,
    method: payment.method,
    amount: payment.amount,
    paid_at: payment.paid_at,
    expires_at: waiting ? addMinutesToDateTime(order.created_at, PAYMENT_HOLD_MINUTES) : null,
    seconds_left: waiting
      ? Math.max(0, PAYMENT_HOLD_MINUTES * 60 - payment.order_age_seconds)
      : null,
    invoice_number: payment.invoice_number,
  };
};
