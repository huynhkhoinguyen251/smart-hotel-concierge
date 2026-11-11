import { Router } from 'express';
import * as transportBookingsController from '../controllers/transportBookings.controller.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import {
  createTransportBookingValidator,
  listMyTransportBookingsValidator,
  transportBookingIdValidator,
} from '../validators/transportBookings.validator.js';

const router = Router();

// Mọi API đơn vận chuyển đều cần đăng nhập.
router.use(authenticate);

router.post(
  '/',
  createTransportBookingValidator,
  validate,
  transportBookingsController.createTransportBooking,
);
router.get(
  '/',
  listMyTransportBookingsValidator,
  validate,
  transportBookingsController.getMyTransportBookings,
);
router.get(
  '/:id',
  transportBookingIdValidator,
  validate,
  transportBookingsController.getMyTransportBooking,
);
router.patch(
  '/:id/cancel',
  transportBookingIdValidator,
  validate,
  transportBookingsController.cancelMyTransportBooking,
);

export default router;
