import { matchedData } from 'express-validator';
import * as tourBookingsService from '../services/tourBookings.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user luôn lấy từ token, không lấy từ body.

export const createTourBooking = async (req, res) => {
  const tourBooking = await tourBookingsService.createTourBooking(req.user.id, matchedData(req));
  sendSuccess(res, tourBooking, 'Tour booked successfully', 201);
};

export const getMyTourBookings = async (req, res) => {
  const { tourBookings, pagination } = await tourBookingsService.listMyTourBookings(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, tourBookings, pagination);
};

export const getMyTourBooking = async (req, res) => {
  const { id } = matchedData(req);
  const tourBooking = await tourBookingsService.getMyTourBooking(req.user.id, id);
  sendSuccess(res, tourBooking, 'Tour booking retrieved successfully');
};

export const cancelMyTourBooking = async (req, res) => {
  const { id } = matchedData(req);
  const tourBooking = await tourBookingsService.cancelMyTourBooking(req.user.id, id);
  sendSuccess(res, tourBooking, 'Tour booking cancelled successfully');
};
