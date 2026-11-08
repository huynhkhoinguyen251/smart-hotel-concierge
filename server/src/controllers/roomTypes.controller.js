import * as roomTypesService from '../services/roomTypes.service.js';
import { sendSuccess } from '../utils/response.js';

export const getRoomTypes = async (req, res) => {
  const roomTypes = await roomTypesService.getRoomTypes();
  sendSuccess(res, roomTypes, 'Room types retrieved successfully');
};
