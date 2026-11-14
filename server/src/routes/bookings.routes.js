import { Router } from 'express';
import * as bookingsController from '../controllers/bookings.controller.js';
import authenticate from '../middlewares/authenticate.js';
import requireGuest from '../middlewares/requireGuest.js';
import validate from '../middlewares/validate.js';
import {
  bookingIdValidator,
  createBookingValidator,
  listMyBookingsValidator,
  updateBookingValidator,
} from '../validators/bookings.validator.js';

const router = Router();

// Mọi API đặt phòng đều cần đăng nhập.
router.use(authenticate);

// Admin không được tạo đơn của khách; các route xem, sửa, hủy vẫn mở.
router.post('/', requireGuest, createBookingValidator, validate, bookingsController.createBooking);
router.get('/', listMyBookingsValidator, validate, bookingsController.getMyBookings);
router.get('/:id', bookingIdValidator, validate, bookingsController.getMyBooking);
router.put('/:id', updateBookingValidator, validate, bookingsController.updateMyBooking);
router.patch('/:id/cancel', bookingIdValidator, validate, bookingsController.cancelMyBooking);

export default router;
