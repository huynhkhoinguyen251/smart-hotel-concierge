import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Đặt tour. tour_date dạng "YYYY-MM-DD". Backend tự lấy giá và tính tổng tiền.
export const createTourBooking = async ({ tour_id, tour_date, participants, note }) => {
  const body = await client.post('/tour-bookings', {
    tour_id,
    tour_date,
    participants,
    ...(note ? { note } : {}),
  });
  return body.data;
};

// Đơn tour của tôi, mới nhất trước. Trả { tourBookings, pagination }.
export const getMyTourBookings = async ({ status, page, limit } = {}) => {
  const body = await client.get('/tour-bookings', { params: cleanParams({ status, page, limit }) });
  return { tourBookings: body.data, pagination: body.pagination };
};

export const getTourBooking = async (id) => {
  const body = await client.get(`/tour-bookings/${id}`);
  return body.data;
};

// Chỉ hủy được khi đơn còn pending.
export const cancelTourBooking = async (id) => {
  const body = await client.patch(`/tour-bookings/${id}/cancel`);
  return body.data;
};
