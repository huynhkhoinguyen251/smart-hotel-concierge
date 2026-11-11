import { matchedData } from 'express-validator';
import * as transportBookingsService from '../services/transportBookings.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user luôn lấy từ token, không lấy từ body.

export const createTransportBooking = async (req, res) => {
  const transportBooking = await transportBookingsService.createTransportBooking(
    req.user.id,
    matchedData(req),
  );
  sendSuccess(res, transportBooking, 'Transport booked successfully', 201);
};

export const getMyTransportBookings = async (req, res) => {
  const { transportBookings, pagination } =
    await transportBookingsService.listMyTransportBookings(req.user.id, matchedData(req));
  sendPaginated(res, transportBookings, pagination);
};

export const getMyTransportBooking = async (req, res) => {
  const { id } = matchedData(req);
  const transportBooking = await transportBookingsService.getMyTransportBooking(req.user.id, id);
  sendSuccess(res, transportBooking, 'Transport booking retrieved successfully');
};

export const cancelMyTransportBooking = async (req, res) => {
  const { id } = matchedData(req);
  const transportBooking = await transportBookingsService.cancelMyTransportBooking(
    req.user.id,
    id,
  );
  sendSuccess(res, transportBooking, 'Transport booking cancelled successfully');
};
