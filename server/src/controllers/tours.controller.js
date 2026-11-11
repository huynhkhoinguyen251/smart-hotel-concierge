import { matchedData } from 'express-validator';
import * as toursService from '../services/tours.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export const getTours = async (req, res) => {
  const { tours, pagination } = await toursService.listTours(matchedData(req));
  sendPaginated(res, tours, pagination);
};

export const getTour = async (req, res) => {
  const { id } = matchedData(req);
  const tour = await toursService.getTour(id);
  sendSuccess(res, tour, 'Tour retrieved successfully');
};
