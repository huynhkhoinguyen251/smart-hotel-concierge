import { Router } from 'express';
import * as paymentsController from '../controllers/payments.controller.js';
import authenticate from '../middlewares/authenticate.js';
import expireUnpaidOrders from '../middlewares/expireUnpaidOrders.js';
import requireGuest from '../middlewares/requireGuest.js';
import validate from '../middlewares/validate.js';
import {
  createPaymentValidator,
  listMyPaymentsValidator,
  paymentIdValidator,
} from '../validators/payments.validator.js';

const router = Router();

// Mọi API thanh toán đều cần đăng nhập.
router.use(authenticate);

// Admin không thanh toán thay khách.
router.post(
  '/',
  requireGuest,
  createPaymentValidator,
  validate,
  expireUnpaidOrders,
  paymentsController.payOrder,
);
router.get(
  '/',
  listMyPaymentsValidator,
  validate,
  expireUnpaidOrders,
  paymentsController.getMyPayments,
);
router.get(
  '/:id',
  paymentIdValidator,
  validate,
  expireUnpaidOrders,
  paymentsController.getMyPayment,
);
router.get('/:id/invoice', paymentIdValidator, validate, paymentsController.getMyInvoice);

export default router;
