import { Router } from 'express';
import * as vouchersController from '../controllers/vouchers.controller.js';
import authenticate from '../middlewares/authenticate.js';
import requireGuest from '../middlewares/requireGuest.js';
import validate from '../middlewares/validate.js';
import { validateVoucherValidator } from '../validators/vouchers.validator.js';

const router = Router();

// Chỉ khách đã đăng nhập; tài khoản admin không đặt đơn nên không cần kiểm tra mã.
router.post('/validate', authenticate, requireGuest, validateVoucherValidator, validate, vouchersController.validateVoucher);

export default router;
