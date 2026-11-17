import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Đặt vận chuyển. payload tạo bằng buildTransportPayload (utils/tourismHelpers.js),
// chỉ gồm các trường loại vận chuyển đó cho phép. Backend tự lấy giá và tính tổng tiền.
export const createTransportBooking = async (payload) => {
  const body = await client.post('/transport-bookings', payload);
  return body.data;
};

// Đơn vận chuyển của tôi, mới nhất trước. Trả { transportBookings, pagination }.
export const getMyTransportBookings = async ({ status, page, limit } = {}) => {
  const body = await client.get('/transport-bookings', {
    params: cleanParams({ status, page, limit }),
  });
  return { transportBookings: body.data, pagination: body.pagination };
};

export const getTransportBooking = async (id) => {
  const body = await client.get(`/transport-bookings/${id}`);
  return body.data;
};

// Chỉ hủy được khi đơn còn pending.
export const cancelTransportBooking = async (id) => {
  const body = await client.patch(`/transport-bookings/${id}/cancel`);
  return body.data;
};
