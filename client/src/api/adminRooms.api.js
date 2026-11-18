import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Quản lý phòng và ảnh phòng (admin).

// Mọi trạng thái; lọc bằng status, room_type_id, search (số phòng). Trả { rooms, items, pagination }.
export const getAdminRooms = async (params = {}) => {
  const body = await client.get('/admin/rooms', { params: cleanParams(params) });
  return { rooms: body.data, items: body.data, pagination: body.pagination };
};

// Chi tiết phòng ở mọi trạng thái, kèm images (ảnh chính đứng đầu) và amenities của loại phòng.
export const getAdminRoom = async (id) => {
  const body = await client.get(`/admin/rooms/${id}`);
  return body.data;
};

// { room_type_id, room_number, floor, status? }. Trùng số phòng thì 409.
export const createAdminRoom = async (data) => {
  const body = await client.post('/admin/rooms', data);
  return body.data;
};

// Chỉ gửi các trường đã đổi (room_type_id, room_number, floor).
export const updateAdminRoom = async (id, changes) => {
  const body = await client.put(`/admin/rooms/${id}`, changes);
  return body.data;
};

export const updateAdminRoomStatus = async (id, status) => {
  const body = await client.patch(`/admin/rooms/${id}/status`, { status });
  return body.data;
};

// Phòng đã có đơn thì 409; khi đó nên đổi sang inactive.
export const deleteAdminRoom = async (id) => {
  await client.delete(`/admin/rooms/${id}`);
};

// image_url: http(s)://... hoặc /uploads/... Ảnh đầu tiên của phòng tự thành ảnh chính.
export const addAdminRoomImage = async (roomId, { image_url, is_primary }) => {
  const body = await client.post(`/admin/rooms/${roomId}/images`, { image_url, is_primary });
  return body.data;
};

export const setAdminRoomImagePrimary = async (imageId) => {
  const body = await client.patch(`/admin/room-images/${imageId}/primary`);
  return body.data;
};

// Xóa ảnh chính thì ảnh còn lại có id nhỏ nhất tự thành ảnh chính.
export const deleteAdminRoomImage = async (imageId) => {
  await client.delete(`/admin/room-images/${imageId}`);
};
