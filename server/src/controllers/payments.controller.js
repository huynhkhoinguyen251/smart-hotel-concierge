import { matchedData } from 'express-validator';
import * as paymentsService from '../services/payments.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user_id luôn lấy từ token, không lấy từ body.

// "I have paid": mô phỏng việc quét mã QR và trả tiền.
export const payOrder = async (req, res) => {
  const payment = await paymentsService.payOrder(req.user.id, matchedData(req));
  sendSuccess(res, payment, 'Payment completed successfully');
};

export const getMyPayments = async (req, res) => {
  const { payments, pagination } = await paymentsService.listMyPayments(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, payments, pagination);
};

export const getMyPayment = async (req, res) => {
  const { id } = matchedData(req);
  const payment = await paymentsService.getMyPayment(req.user.id, id);
  sendSuccess(res, payment, 'Payment retrieved successfully');
};

export const getMyInvoice = async (req, res) => {
  const { id } = matchedData(req);
  const invoice = await paymentsService.getMyInvoice(req.user.id, id);
  sendSuccess(res, invoice, 'Invoice retrieved successfully');
};
