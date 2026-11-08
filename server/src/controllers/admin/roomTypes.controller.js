import { matchedData } from 'express-validator';
import * as roomTypesService from '../../services/admin/roomTypes.service.js';
import { sendSuccess } from '../../utils/response.js';

// includeOptionals để giữ description = null, nghĩa là xóa mô tả.
const getData = (req) => matchedData(req, { includeOptionals: true });

export const createRoomType = async (req, res) => {
  const roomType = await roomTypesService.createRoomType(getData(req));
  sendSuccess(res, roomType, 'Room type created successfully', 201);
};

export const updateRoomType = async (req, res) => {
  const { id, ...data } = getData(req);
  const roomType = await roomTypesService.updateRoomType(id, data);
  sendSuccess(res, roomType, 'Room type updated successfully');
};

export const deleteRoomType = async (req, res) => {
  const { id } = matchedData(req);
  await roomTypesService.deleteRoomType(id);
  sendSuccess(res, null, 'Room type deleted successfully');
};
