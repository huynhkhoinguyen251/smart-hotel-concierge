import { matchedData } from 'express-validator';
import * as servicesService from '../../services/admin/services.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getServices = async (req, res) => {
  const { services, pagination } = await servicesService.listServices(matchedData(req));
  sendPaginated(res, services, pagination);
};

export const createService = async (req, res) => {
  const service = await servicesService.createService(matchedData(req));
  sendSuccess(res, service, 'Service created successfully', 201);
};

export const updateService = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const service = await servicesService.updateService(id, data);
  sendSuccess(res, service, 'Service updated successfully');
};

export const deleteService = async (req, res) => {
  const { id } = matchedData(req);
  await servicesService.deleteService(id);
  sendSuccess(res, null, 'Service deleted successfully');
};
