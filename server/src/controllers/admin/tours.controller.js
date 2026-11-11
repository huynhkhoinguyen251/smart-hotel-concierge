import { matchedData } from 'express-validator';
import * as toursService from '../../services/admin/tours.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getTours = async (req, res) => {
  const { tours, pagination } = await toursService.listTours(matchedData(req));
  sendPaginated(res, tours, pagination);
};

export const createTour = async (req, res) => {
  const tour = await toursService.createTour(matchedData(req));
  sendSuccess(res, tour, 'Tour created successfully', 201);
};

export const updateTour = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const tour = await toursService.updateTour(id, data);
  sendSuccess(res, tour, 'Tour updated successfully');
};

export const deleteTour = async (req, res) => {
  const { id } = matchedData(req);
  await toursService.deleteTour(id);
  sendSuccess(res, null, 'Tour deleted successfully');
};
