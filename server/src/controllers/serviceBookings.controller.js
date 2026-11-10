import { matchedData } from 'express-validator';
import * as serviceBookingsService from '../services/serviceBookings.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// req.user do middleware authenticate gán; user luôn lấy từ token, không lấy từ body.

export const createServiceBooking = async (req, res) => {
  const serviceBooking = await serviceBookingsService.createServiceBooking(
    req.user.id,
    matchedData(req),
  );
  sendSuccess(res, serviceBooking, 'Service request created successfully', 201);
};

export const getMyServiceBookings = async (req, res) => {
  const { serviceBookings, pagination } = await serviceBookingsService.listMyServiceBookings(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, serviceBookings, pagination);
};

export const getMyServiceBooking = async (req, res) => {
  const { id } = matchedData(req);
  const serviceBooking = await serviceBookingsService.getMyServiceBooking(req.user.id, id);
  sendSuccess(res, serviceBooking, 'Service request retrieved successfully');
};

export const cancelMyServiceBooking = async (req, res) => {
  const { id } = matchedData(req);
  const serviceBooking = await serviceBookingsService.cancelMyServiceBooking(req.user.id, id);
  sendSuccess(res, serviceBooking, 'Service request cancelled successfully');
};
