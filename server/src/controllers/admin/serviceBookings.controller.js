import { matchedData } from 'express-validator';
import * as serviceBookingsService from '../../services/admin/serviceBookings.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getServiceBookings = async (req, res) => {
  const { serviceBookings, pagination } = await serviceBookingsService.listServiceBookings(
    matchedData(req),
  );
  sendPaginated(res, serviceBookings, pagination);
};

export const getServiceBooking = async (req, res) => {
  const { id } = matchedData(req);
  const serviceBooking = await serviceBookingsService.getServiceBooking(id);
  sendSuccess(res, serviceBooking, 'Service request retrieved successfully');
};

export const updateServiceBookingStatus = async (req, res) => {
  const { id, status } = matchedData(req);
  const serviceBooking = await serviceBookingsService.updateServiceBookingStatus(id, status);
  sendSuccess(res, serviceBooking, 'Service request status updated successfully');
};
