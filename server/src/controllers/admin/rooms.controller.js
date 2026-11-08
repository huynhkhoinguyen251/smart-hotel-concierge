import { matchedData } from 'express-validator';
import * as roomImagesService from '../../services/admin/roomImages.service.js';
import * as roomsService from '../../services/admin/rooms.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getRooms = async (req, res) => {
  const { rooms, pagination } = await roomsService.listRooms(matchedData(req));
  sendPaginated(res, rooms, pagination);
};

export const createRoom = async (req, res) => {
  const room = await roomsService.createRoom(matchedData(req));
  sendSuccess(res, room, 'Room created successfully', 201);
};

export const updateRoom = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const room = await roomsService.updateRoom(id, data);
  sendSuccess(res, room, 'Room updated successfully');
};

export const updateRoomStatus = async (req, res) => {
  const { id, status } = matchedData(req);
  const room = await roomsService.updateRoomStatus(id, status);
  sendSuccess(res, room, 'Room status updated successfully');
};

export const deleteRoom = async (req, res) => {
  const { id } = matchedData(req);
  await roomsService.deleteRoom(id);
  sendSuccess(res, null, 'Room deleted successfully');
};

export const addRoomImage = async (req, res) => {
  const { id, image_url, is_primary } = matchedData(req);
  const image = await roomImagesService.addImage(id, { image_url, is_primary });
  sendSuccess(res, image, 'Image added successfully', 201);
};
