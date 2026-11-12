import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Tìm và lọc phòng. Trả { rooms, pagination }.
export const getRooms = async (params = {}) => {
  const body = await client.get('/rooms', { params: cleanParams(params) });
  return { rooms: body.data, pagination: body.pagination };
};

// Chi tiết phòng, kèm mô tả, tiện nghi và ảnh.
export const getRoom = async (id) => {
  const body = await client.get(`/rooms/${id}`);
  return body.data;
};

// Trả { available, reason, nights, price_per_night, estimated_total }.
export const checkAvailability = async (id, { check_in, check_out }) => {
  const body = await client.get(`/rooms/${id}/availability`, {
    params: cleanParams({ check_in, check_out }),
  });
  return body.data;
};

// Trả { summary, reviews, pagination }.
export const getRoomReviews = async (id, { page, limit } = {}) => {
  const body = await client.get(`/rooms/${id}/reviews`, { params: cleanParams({ page, limit }) });
  return { ...body.data, pagination: body.pagination };
};
