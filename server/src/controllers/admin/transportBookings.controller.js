import { matchedData } from 'express-validator';
import * as transportBookingsService from '../../services/admin/transportBookings.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getTransportBookings = async (req, res) => {
  const { transportBookings, pagination } = await transportBookingsService.listTransportBookings(
    matchedData(req),
  );
  sendPaginated(res, transportBookings, pagination);
};

export const getTransportBooking = async (req, res) => {
  const { id } = matchedData(req);
  const transportBooking = await transportBookingsService.getTransportBooking(id);
  sendSuccess(res, transportBooking, 'Transport booking retrieved successfully');
};

export const updateTransportBookingStatus = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const transportBooking = await transportBookingsService.updateTransportBookingStatus(id, data);
  sendSuccess(res, transportBooking, 'Transport booking status updated successfully');
};
