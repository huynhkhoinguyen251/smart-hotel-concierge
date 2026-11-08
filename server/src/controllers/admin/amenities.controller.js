import { matchedData } from 'express-validator';
import * as amenitiesService from '../../services/admin/amenities.service.js';
import { sendSuccess } from '../../utils/response.js';

export const createAmenity = async (req, res) => {
  const amenity = await amenitiesService.createAmenity(matchedData(req));
  sendSuccess(res, amenity, 'Amenity created successfully', 201);
};

export const updateAmenity = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const amenity = await amenitiesService.updateAmenity(id, data);
  sendSuccess(res, amenity, 'Amenity updated successfully');
};

export const deleteAmenity = async (req, res) => {
  const { id } = matchedData(req);
  await amenitiesService.deleteAmenity(id);
  sendSuccess(res, null, 'Amenity deleted successfully');
};
