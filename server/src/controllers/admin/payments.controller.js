import { matchedData } from 'express-validator';
import * as paymentsService from '../../services/admin/payments.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getPayments = async (req, res) => {
  const { payments, pagination } = await paymentsService.listPayments(matchedData(req));
  sendPaginated(res, payments, pagination);
};

export const refundPayment = async (req, res) => {
  const { id } = matchedData(req);
  const payment = await paymentsService.refundPayment(id);
  sendSuccess(res, payment, 'Payment marked as refunded');
};
