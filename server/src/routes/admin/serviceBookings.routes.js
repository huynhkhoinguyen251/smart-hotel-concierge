import { Router } from 'express';
import * as serviceBookingsController from '../../controllers/admin/serviceBookings.controller.js';
import validate from '../../middlewares/validate.js';
import {
  listAdminServiceBookingsValidator,
  serviceBookingIdValidator,
  updateServiceBookingStatusValidator,
} from '../../validators/admin/serviceBookings.validator.js';

const router = Router();

router.get(
  '/',
  listAdminServiceBookingsValidator,
  validate,
  serviceBookingsController.getServiceBookings,
);
router.get(
  '/:id',
  serviceBookingIdValidator,
  validate,
  serviceBookingsController.getServiceBooking,
);
router.patch(
  '/:id/status',
  updateServiceBookingStatusValidator,
  validate,
  serviceBookingsController.updateServiceBookingStatus,
);

export default router;
