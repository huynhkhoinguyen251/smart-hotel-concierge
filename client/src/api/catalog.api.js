import client from './client.js';

// Danh sách dùng cho bộ lọc phòng.
export const getRoomTypes = async () => {
  const body = await client.get('/room-types');
  return body.data;
};

export const getAmenities = async () => {
  const body = await client.get('/amenities');
  return body.data;
};
