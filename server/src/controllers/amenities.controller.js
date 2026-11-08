import * as amenitiesService from '../services/amenities.service.js';
import { sendSuccess } from '../utils/response.js';

export const getAmenities = async (req, res) => {
  const amenities = await amenitiesService.getAmenities();
  sendSuccess(res, amenities, 'Amenities retrieved successfully');
};
