import { Router } from 'express';
import * as tourBookingsController from '../../controllers/admin/tourBookings.controller.js';
import validate from '../../middlewares/validate.js';
import {
  listAdminTourBookingsValidator,
  tourBookingIdValidator,
  updateTourBookingStatusValidator,
} from '../../validators/admin/tourBookings.validator.js';

const router = Router();

router.get('/', listAdminTourBookingsValidator, validate, tourBookingsController.getTourBookings);
router.get('/:id', tourBookingIdValidator, validate, tourBookingsController.getTourBooking);
router.patch(
  '/:id/status',
  updateTourBookingStatusValidator,
  validate,
  tourBookingsController.updateTourBookingStatus,
);

export default router;
