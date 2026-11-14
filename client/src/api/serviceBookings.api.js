import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Gửi yêu cầu dịch vụ. scheduled_at dạng "YYYY-MM-DD HH:mm". Backend tự lấy giá và tính tổng tiền.
export const createServiceBooking = async ({ booking_id, service_id, scheduled_at, quantity, note }) => {
  const body = await client.post('/service-bookings', {
    booking_id,
    service_id,
    scheduled_at,
    quantity,
    ...(note ? { note } : {}),
  });
  return body.data;
};

// Yêu cầu dịch vụ của tôi, mới nhất trước. Trả { serviceBookings, pagination }.
export const getMyServiceBookings = async ({ status, page, limit } = {}) => {
  const body = await client.get('/service-bookings', {
    params: cleanParams({ status, page, limit }),
  });
  return { serviceBookings: body.data, pagination: body.pagination };
};

export const getServiceBooking = async (id) => {
  const body = await client.get(`/service-bookings/${id}`);
  return body.data;
};

// Chỉ hủy được khi yêu cầu còn pending.
export const cancelServiceBooking = async (id) => {
  const body = await client.patch(`/service-bookings/${id}/cancel`);
  return body.data;
};
