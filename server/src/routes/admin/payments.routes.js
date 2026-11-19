import { Router } from 'express';
import * as paymentsController from '../../controllers/admin/payments.controller.js';
import expireUnpaidOrders from '../../middlewares/expireUnpaidOrders.js';
import validate from '../../middlewares/validate.js';
import {
  listAdminPaymentsValidator,
  paymentIdValidator,
} from '../../validators/payments.validator.js';

const router = Router();

router.get(
  '/',
  listAdminPaymentsValidator,
  validate,
  expireUnpaidOrders,
  paymentsController.getPayments,
);
router.patch('/:id/refund', paymentIdValidator, validate, paymentsController.refundPayment);

export default router;
