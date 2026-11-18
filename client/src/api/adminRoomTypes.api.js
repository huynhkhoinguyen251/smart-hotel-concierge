import client from './client.js';

// Loại phòng và tiện nghi (admin). Danh sách đọc từ API công khai GET /room-types và GET /amenities
// (api/catalog.api.js), vì backend không có API danh sách riêng cho admin.

// { name, description, price_per_night, capacity, amenity_ids }. Trả loại phòng kèm amenities.
export const createAdminRoomType = async (data) => {
  const body = await client.post('/admin/room-types', data);
  return body.data;
};

// Chỉ gửi các trường đã đổi; có amenity_ids thì thay toàn bộ danh sách tiện nghi.
export const updateAdminRoomType = async (id, changes) => {
  const body = await client.put(`/admin/room-types/${id}`, changes);
  return body.data;
};

// Còn phòng thuộc loại này thì 409.
export const deleteAdminRoomType = async (id) => {
  await client.delete(`/admin/room-types/${id}`);
};

export const createAdminAmenity = async (name) => {
  const body = await client.post('/admin/amenities', { name });
  return body.data;
};

export const updateAdminAmenity = async (id, name) => {
  const body = await client.put(`/admin/amenities/${id}`, { name });
  return body.data;
};

// Xóa được cả khi loại phòng đang dùng; các loại phòng đó mất tiện nghi này.
export const deleteAdminAmenity = async (id) => {
  await client.delete(`/admin/amenities/${id}`);
};
