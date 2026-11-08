import { matchedData } from 'express-validator';
import * as roomsService from '../services/rooms.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export const getRooms = async (req, res) => {
  const { rooms, pagination } = await roomsService.listRooms(matchedData(req));
  sendPaginated(res, rooms, pagination);
};

export const getRoomById = async (req, res) => {
  const { id } = matchedData(req);
  const room = await roomsService.getRoomDetail(id);
  sendSuccess(res, room, 'Room retrieved successfully');
};

export const getRoomAvailability = async (req, res) => {
  const { id, check_in, check_out } = matchedData(req);
  const result = await roomsService.checkAvailability(id, { check_in, check_out });
  sendSuccess(res, result, 'Availability checked successfully');
};
