import { matchedData } from 'express-validator';
import * as bookingsService from '../services/bookings.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user_id luôn lấy từ token, không lấy từ body.

export const createBooking = async (req, res) => {
  const booking = await bookingsService.createBooking(req.user.id, matchedData(req));
  sendSuccess(res, booking, 'Booking created successfully', 201);
};

export const getMyBookings = async (req, res) => {
  const { bookings, pagination } = await bookingsService.listMyBookings(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, bookings, pagination);
};

export const getMyBooking = async (req, res) => {
  const { id } = matchedData(req);
  const booking = await bookingsService.getMyBooking(req.user.id, id);
  sendSuccess(res, booking, 'Booking retrieved successfully');
};

export const updateMyBooking = async (req, res) => {
  const { id, check_in, check_out, guests } = matchedData(req);
  const booking = await bookingsService.updateMyBooking(req.user.id, id, {
    check_in,
    check_out,
    guests,
  });
  sendSuccess(res, booking, 'Booking updated successfully');
};

export const cancelMyBooking = async (req, res) => {
  const { id } = matchedData(req);
  const booking = await bookingsService.cancelMyBooking(req.user.id, id);
  sendSuccess(res, booking, 'Booking cancelled successfully');
};
