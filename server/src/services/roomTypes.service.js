import * as amenitiesModel from '../models/amenities.model.js';
import * as roomTypesModel from '../models/roomTypes.model.js';

// Gắn danh sách tiện nghi vào từng loại phòng bằng một truy vấn, thay vì truy vấn riêng cho từng loại.
export const attachAmenities = async (roomTypes) => {
  const amenities = await amenitiesModel.findAmenitiesByRoomTypeIds(roomTypes.map(({ id }) => id));

  const amenitiesByType = new Map(roomTypes.map(({ id }) => [id, []]));
  for (const { room_type_id: roomTypeId, id, name } of amenities) {
    amenitiesByType.get(roomTypeId).push({ id, name });
  }

  return roomTypes.map((roomType) => ({
    ...roomType,
    amenities: amenitiesByType.get(roomType.id),
  }));
};

export const getRoomTypes = async () => attachAmenities(await roomTypesModel.findAllRoomTypes());
