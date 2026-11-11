import { Router } from 'express';
import * as transportBookingsController from '../../controllers/admin/transportBookings.controller.js';
import validate from '../../middlewares/validate.js';
import {
  listAdminTransportBookingsValidator,
  transportBookingIdValidator,
  updateTransportBookingStatusValidator,
} from '../../validators/admin/transportBookings.validator.js';

const router = Router();

router.get(
  '/',
  listAdminTransportBookingsValidator,
  validate,
  transportBookingsController.getTransportBookings,
);
router.get(
  '/:id',
  transportBookingIdValidator,
  validate,
  transportBookingsController.getTransportBooking,
);
router.patch(
  '/:id/status',
  updateTransportBookingStatusValidator,
  validate,
  transportBookingsController.updateTransportBookingStatus,
);

export default router;
