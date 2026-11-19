import { Router } from 'express';
import * as transportBookingsController from '../../controllers/admin/transportBookings.controller.js';
import expireUnpaidOrders from '../../middlewares/expireUnpaidOrders.js';
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
  expireUnpaidOrders,
  transportBookingsController.getTransportBookings,
);
router.get(
  '/:id',
  transportBookingIdValidator,
  validate,
  expireUnpaidOrders,
  transportBookingsController.getTransportBooking,
);
router.patch(
  '/:id/status',
  updateTransportBookingStatusValidator,
  validate,
  transportBookingsController.updateTransportBookingStatus,
);

export default router;
