import { matchedData } from 'express-validator';
import * as tourBookingsService from '../../services/admin/tourBookings.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getTourBookings = async (req, res) => {
  const { tourBookings, pagination } = await tourBookingsService.listTourBookings(
    matchedData(req),
  );
  sendPaginated(res, tourBookings, pagination);
};

export const getTourBooking = async (req, res) => {
  const { id } = matchedData(req);
  const tourBooking = await tourBookingsService.getTourBooking(id);
  sendSuccess(res, tourBooking, 'Tour booking retrieved successfully');
};

export const updateTourBookingStatus = async (req, res) => {
  const { id, status } = matchedData(req);
  const tourBooking = await tourBookingsService.updateTourBookingStatus(id, status);
  sendSuccess(res, tourBooking, 'Tour booking status updated successfully');
};
