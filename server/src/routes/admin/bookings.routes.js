import { Router } from 'express';
import * as bookingsController from '../../controllers/admin/bookings.controller.js';
import validate from '../../middlewares/validate.js';
import {
  bookingIdValidator,
  listAdminBookingsValidator,
  updateBookingStatusValidator,
} from '../../validators/admin/bookings.validator.js';

const router = Router();

router.get('/', listAdminBookingsValidator, validate, bookingsController.getBookings);
router.get('/:id', bookingIdValidator, validate, bookingsController.getBooking);
router.patch(
  '/:id/status',
  updateBookingStatusValidator,
  validate,
  bookingsController.updateBookingStatus,
);

export default router;
