import { Router } from 'express';
import * as tourBookingsController from '../controllers/tourBookings.controller.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import {
  createTourBookingValidator,
  listMyTourBookingsValidator,
  tourBookingIdValidator,
} from '../validators/tourBookings.validator.js';

const router = Router();

// Mọi API đơn tour đều cần đăng nhập.
router.use(authenticate);

router.post('/', createTourBookingValidator, validate, tourBookingsController.createTourBooking);
router.get('/', listMyTourBookingsValidator, validate, tourBookingsController.getMyTourBookings);
router.get('/:id', tourBookingIdValidator, validate, tourBookingsController.getMyTourBooking);
router.patch(
  '/:id/cancel',
  tourBookingIdValidator,
  validate,
  tourBookingsController.cancelMyTourBooking,
);

export default router;
