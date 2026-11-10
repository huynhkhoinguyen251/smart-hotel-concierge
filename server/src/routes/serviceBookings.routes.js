import { Router } from 'express';
import * as serviceBookingsController from '../controllers/serviceBookings.controller.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import {
  createServiceBookingValidator,
  listMyServiceBookingsValidator,
  serviceBookingIdValidator,
} from '../validators/serviceBookings.validator.js';

const router = Router();

// Mọi API yêu cầu dịch vụ đều cần đăng nhập.
router.use(authenticate);

router.post(
  '/',
  createServiceBookingValidator,
  validate,
  serviceBookingsController.createServiceBooking,
);
router.get(
  '/',
  listMyServiceBookingsValidator,
  validate,
  serviceBookingsController.getMyServiceBookings,
);
router.get(
  '/:id',
  serviceBookingIdValidator,
  validate,
  serviceBookingsController.getMyServiceBooking,
);
router.patch(
  '/:id/cancel',
  serviceBookingIdValidator,
  validate,
  serviceBookingsController.cancelMyServiceBooking,
);

export default router;
