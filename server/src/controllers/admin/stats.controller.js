import { matchedData } from 'express-validator';
import * as statsService from '../../services/admin/stats.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getOverview = async (req, res) => {
  const overview = await statsService.getOverview();
  sendSuccess(res, overview, 'Overview retrieved successfully');
};

export const getRevenue = async (req, res) => {
  const revenue = await statsService.getMonthlyRevenue(matchedData(req));
  sendSuccess(res, revenue, 'Revenue retrieved successfully');
};

export const getTopRooms = async (req, res) => {
  const rooms = await statsService.getTopRooms(matchedData(req));
  sendSuccess(res, rooms, 'Top rooms retrieved successfully');
};

export const getTopServices = async (req, res) => {
  const services = await statsService.getTopServices(matchedData(req));
  sendSuccess(res, services, 'Top services retrieved successfully');
};

export const getFeedback = async (req, res) => {
  const feedback = await statsService.getFeedback();
  sendSuccess(res, feedback, 'Feedback statistics retrieved successfully');
};
