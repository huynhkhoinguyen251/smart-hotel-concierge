import { withTransaction } from '../../config/db.js';
import * as amenitiesModel from '../../models/amenities.model.js';
import * as roomsModel from '../../models/rooms.model.js';
import * as roomTypesModel from '../../models/roomTypes.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';
import { attachAmenities } from '../roomTypes.service.js';

const ROOM_TYPE_NOT_FOUND = 'Room type not found';
const AMENITIES_MISSING = 'One or more amenities do not exist';
const ROOM_TYPE_IN_USE = 'This room type still has rooms and cannot be deleted';

const ROOM_TYPE_DB_ERRORS = {
  duplicate: 'Room type name already exists',
  missingReference: AMENITIES_MISSING,
  referenced: ROOM_TYPE_IN_USE,
};

const findRoomTypeOr404 = async (id, conn) => {
  const roomType = await roomTypesModel.findRoomTypeById(id, conn);
  if (!roomType) {
    throw new AppError(404, ROOM_TYPE_NOT_FOUND);
  }
  return roomType;
};

// amenity_ids không tồn tại là lỗi dữ liệu gửi lên (400). ids đã được validator bỏ trùng.
const ensureAmenitiesExist = async (amenityIds, conn) => {
  if (!amenityIds?.length) {
    return;
  }
  if ((await amenitiesModel.countExistingAmenities(amenityIds, conn)) !== amenityIds.length) {
    throw new AppError(400, AMENITIES_MISSING);
  }
};

// Loại phòng kèm danh sách tiện nghi, giống một phần tử của GET /api/room-types.
const getRoomTypeWithAmenities = async (id) => {
  const [roomType] = await attachAmenities([await findRoomTypeOr404(id)]);
  return roomType;
};

// Ghi room_types và room_type_amenities trong cùng một transaction.
export const createRoomType = async ({ amenity_ids, name, description, price_per_night, capacity }) => {
  try {
    const id = await withTransaction(async (conn) => {
      await ensureAmenitiesExist(amenity_ids, conn);
      const newId = await roomTypesModel.createRoomType(
        { name, description, price_per_night, capacity },
        conn,
      );
      if (amenity_ids?.length) {
        await roomTypesModel.replaceRoomTypeAmenities(newId, amenity_ids, conn);
      }
      return newId;
    });
    return await getRoomTypeWithAmenities(id);
  } catch (error) {
    throw mapDbError(error, ROOM_TYPE_DB_ERRORS);
  }
};

// Chỉ sửa trường được gửi lên. Nếu có amenity_ids thì thay toàn bộ danh sách tiện nghi.
export const updateRoomType = async (
  id,
  { amenity_ids, name, description, price_per_night, capacity },
) => {
  try {
    await withTransaction(async (conn) => {
      await findRoomTypeOr404(id, conn);
      await ensureAmenitiesExist(amenity_ids, conn);
      await roomTypesModel.updateRoomType(id, { name, description, price_per_night, capacity }, conn);
      if (amenity_ids !== undefined) {
        await roomTypesModel.replaceRoomTypeAmenities(id, amenity_ids, conn);
      }
    });
    return await getRoomTypeWithAmenities(id);
  } catch (error) {
    throw mapDbError(error, ROOM_TYPE_DB_ERRORS);
  }
};

export const deleteRoomType = async (id) => {
  await findRoomTypeOr404(id);
  if (await roomsModel.hasRoomsOfType(id)) {
    throw new AppError(409, ROOM_TYPE_IN_USE);
  }

  try {
    await roomTypesModel.deleteRoomType(id);
  } catch (error) {
    // Có phòng mới được thêm vào loại này ngay sau bước kiểm tra ở trên.
    throw mapDbError(error, ROOM_TYPE_DB_ERRORS);
  }
};
