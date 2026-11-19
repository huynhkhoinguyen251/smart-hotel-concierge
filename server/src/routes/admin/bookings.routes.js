import { Router } from 'express';
import * as bookingsController from '../../controllers/admin/bookings.controller.js';
import expireUnpaidOrders from '../../middlewares/expireUnpaidOrders.js';
import validate from '../../middlewares/validate.js';
import {
  bookingIdValidator,
  listAdminBookingsValidator,
  updateBookingStatusValidator,
} from '../../validators/admin/bookings.validator.js';

const router = Router();

router.get(
  '/',
  listAdminBookingsValidator,
  validate,
  expireUnpaidOrders,
  bookingsController.getBookings,
);
router.get(
  '/:id',
  bookingIdValidator,
  validate,
  expireUnpaidOrders,
  bookingsController.getBooking,
);
router.patch(
  '/:id/status',
  updateBookingStatusValidator,
  validate,
  bookingsController.updateBookingStatus,
);

export default router;
