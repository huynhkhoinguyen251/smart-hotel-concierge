import { matchedData } from 'express-validator';
import * as bookingsService from '../../services/admin/bookings.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getBookings = async (req, res) => {
  const { bookings, pagination } = await bookingsService.listBookings(matchedData(req));
  sendPaginated(res, bookings, pagination);
};

export const getBooking = async (req, res) => {
  const { id } = matchedData(req);
  const booking = await bookingsService.getBooking(id);
  sendSuccess(res, booking, 'Booking retrieved successfully');
};

export const updateBookingStatus = async (req, res) => {
  const { id, status } = matchedData(req);
  const booking = await bookingsService.updateBookingStatus(id, status);
  sendSuccess(res, booking, 'Booking status updated successfully');
};
