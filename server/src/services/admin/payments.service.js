import { withTransaction } from '../../config/db.js';
import * as paymentsModel from '../../models/payments.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';
import { findPaymentOr404, PAYMENT_NOT_FOUND, toPaymentResponse } from '../payments.service.js';

// Admin xem tất cả thanh toán, lọc bằng status và type (loại đơn), kèm khách và đơn.
export const listPayments = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [payments, total] = await Promise.all([
    paymentsModel.findPayments({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    paymentsModel.countPayments(filters),
  ]);

  return {
    payments: payments.map((payment) => toPaymentResponse(payment, { withUser: true })),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

// Đánh dấu đã hoàn tiền bằng tay. Bình thường việc hoàn tiền tự xảy ra khi hủy đơn đã trả;
// API này chỉ là lưới an toàn: thanh toán phải đang paid và đơn phải đã bị hủy.
export const refundPayment = async (id) => {
  await withTransaction(async (conn) => {
    const payment = await paymentsModel.lockPaymentById(id, conn);
    if (!payment) {
      throw new AppError(404, PAYMENT_NOT_FOUND);
    }
    if (payment.status !== 'paid') {
      throw new AppError(
        400,
        `Only paid payments can be refunded; this payment is ${payment.status}`,
      );
    }
    if (payment.order_status !== 'cancelled') {
      throw new AppError(400, 'Only payments of cancelled orders can be refunded');
    }
    await paymentsModel.updatePaymentStatus(payment.id, 'refunded', conn);
  });

  return toPaymentResponse(await findPaymentOr404(id), { withUser: true });
};
