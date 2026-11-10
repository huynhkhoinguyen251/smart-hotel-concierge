import { matchedData } from 'express-validator';
import * as servicesService from '../services/services.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export const getServices = async (req, res) => {
  const { services, pagination } = await servicesService.listServices(matchedData(req));
  sendPaginated(res, services, pagination);
};

export const getService = async (req, res) => {
  const { id } = matchedData(req);
  const service = await servicesService.getService(id);
  sendSuccess(res, service, 'Service retrieved successfully');
};
