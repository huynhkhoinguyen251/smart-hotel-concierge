import * as amenitiesModel from '../models/amenities.model.js';
import * as roomImagesModel from '../models/roomImages.model.js';
import * as roomsModel from '../models/rooms.model.js';
import AppError from '../utils/AppError.js';
import { countNights } from '../utils/date.js';
import { getPagination } from '../utils/pagination.js';

const ROOM_NOT_FOUND_MESSAGE = 'Room not found';

export const listRooms = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [rooms, total] = await Promise.all([
    roomsModel.findRooms({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    roomsModel.countRooms(filters),
  ]);

  return { rooms, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

// Phòng inactive coi như không tồn tại với người dùng. Phòng maintenance vẫn xem được.
const findVisibleRoom = async (id) => {
  const room = await roomsModel.findRoomById(id);
  if (!room || room.status === 'inactive') {
    throw new AppError(404, ROOM_NOT_FOUND_MESSAGE);
  }
  return room;
};

export const getRoomDetail = async (id) => {
  const room = await findVisibleRoom(id);

  const [images, amenities] = await Promise.all([
    roomImagesModel.findImagesByRoomId(room.id),
    amenitiesModel.findAmenitiesByRoomTypeIds([room.room_type.id]),
  ]);

  return {
    ...room,
    amenities: amenities.map(({ id: amenityId, name }) => ({ id: amenityId, name })),
    images,
  };
};

export const checkAvailability = async (id, { check_in, check_out }) => {
  const room = await findVisibleRoom(id);

  let reason = null;
  if (room.status === 'maintenance') {
    reason = 'Room is under maintenance';
  } else if (await roomsModel.hasOverlappingBooking(room.id, check_in, check_out)) {
    reason = 'Room is already booked for these dates';
  }

  const nights = countNights(check_in, check_out);
  const pricePerNight = room.room_type.price_per_night;

  return {
    available: reason === null,
    reason,
    nights,
    price_per_night: pricePerNight,
    // Làm tròn 2 chữ số để tránh sai số khi nhân số thập phân trong JavaScript.
    estimated_total: Math.round(nights * pricePerNight * 100) / 100,
  };
};
