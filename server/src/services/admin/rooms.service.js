import * as roomsModel from '../../models/rooms.model.js';
import * as roomTypesModel from '../../models/roomTypes.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';
import { getPagination } from '../../utils/pagination.js';

const ROOM_NOT_FOUND = 'Room not found';
const ROOM_TYPE_MISSING = 'Room type does not exist';
const ROOM_HAS_BOOKINGS =
  'This room has bookings and cannot be deleted. Change its status to inactive instead.';

const ROOM_DB_ERRORS = {
  duplicate: 'Room number already exists',
  missingReference: ROOM_TYPE_MISSING,
  referenced: ROOM_HAS_BOOKINGS,
};

export const findRoomOr404 = async (id) => {
  const room = await roomsModel.findRoomById(id);
  if (!room) {
    throw new AppError(404, ROOM_NOT_FOUND);
  }
  return room;
};

// room_type_id không tồn tại là lỗi dữ liệu gửi lên (400), không phải 404.
const ensureRoomTypeExists = async (roomTypeId) => {
  if (!(await roomTypesModel.findRoomTypeById(roomTypeId))) {
    throw new AppError(400, ROOM_TYPE_MISSING);
  }
};

export const listRooms = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [rooms, total] = await Promise.all([
    roomsModel.findAllRooms({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    roomsModel.countAllRooms(filters),
  ]);

  return { rooms, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

export const createRoom = async ({ room_type_id, room_number, floor, status = 'available' }) => {
  await ensureRoomTypeExists(room_type_id);

  let id;
  try {
    id = await roomsModel.createRoom({ room_type_id, room_number, floor, status });
  } catch (error) {
    // Trùng room_number, hoặc loại phòng vừa bị xóa sau bước kiểm tra ở trên.
    throw mapDbError(error, ROOM_DB_ERRORS);
  }
  return findRoomOr404(id);
};

export const updateRoom = async (id, { room_type_id, room_number, floor }) => {
  await findRoomOr404(id);
  if (room_type_id !== undefined) {
    await ensureRoomTypeExists(room_type_id);
  }

  try {
    await roomsModel.updateRoom(id, { room_type_id, room_number, floor });
  } catch (error) {
    throw mapDbError(error, ROOM_DB_ERRORS);
  }
  return findRoomOr404(id);
};

export const updateRoomStatus = async (id, status) => {
  await findRoomOr404(id);
  await roomsModel.updateRoomStatus(id, status);
  return findRoomOr404(id);
};

// Phòng đã có bất kỳ đơn nào thì không xóa được, để giữ lịch sử đặt phòng.
export const deleteRoom = async (id) => {
  await findRoomOr404(id);
  if (await roomsModel.hasAnyBooking(id)) {
    throw new AppError(409, ROOM_HAS_BOOKINGS);
  }

  try {
    await roomsModel.deleteRoom(id);
  } catch (error) {
    // Có đơn mới được tạo ngay sau bước kiểm tra ở trên.
    throw mapDbError(error, ROOM_DB_ERRORS);
  }
};
