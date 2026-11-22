import { Router } from 'express';
import * as vouchersController from '../../controllers/admin/vouchers.controller.js';
import validate from '../../middlewares/validate.js';
import {
  createVoucherValidator,
  listAdminVouchersValidator,
  updateVoucherValidator,
  voucherIdValidator,
} from '../../validators/vouchers.validator.js';

const router = Router();

router.get('/', listAdminVouchersValidator, validate, vouchersController.getVouchers);
router.post('/', createVoucherValidator, validate, vouchersController.createVoucher);
router.put('/:id', updateVoucherValidator, validate, vouchersController.updateVoucher);
router.delete('/:id', voucherIdValidator, validate, vouchersController.deleteVoucher);

export default router;
