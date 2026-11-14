import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Đặt phòng. Backend tự lấy giá và tính tổng tiền; trả đơn vừa tạo.
export const createBooking = async ({ room_id, check_in, check_out, guests }) => {
  const body = await client.post('/bookings', { room_id, check_in, check_out, guests });
  return body.data;
};

// Đơn của tôi, mới nhất trước. Trả { bookings, pagination }.
export const getMyBookings = async ({ status, page, limit } = {}) => {
  const body = await client.get('/bookings', { params: cleanParams({ status, page, limit }) });
  return { bookings: body.data, pagination: body.pagination };
};

export const getBooking = async (id) => {
  const body = await client.get(`/bookings/${id}`);
  return body.data;
};

// Chỉ khi đơn còn pending. Đổi ngày thì gửi cả check_in và check_out; có thể chỉ gửi guests.
export const updateBooking = async (id, changes) => {
  const body = await client.put(`/bookings/${id}`, changes);
  return body.data;
};

export const cancelBooking = async (id) => {
  const body = await client.patch(`/bookings/${id}/cancel`);
  return body.data;
};
