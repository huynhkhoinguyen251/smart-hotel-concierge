import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Thống kê cho admin. Mọi hàm cần token admin.

// { bookings: { total, by_status }, revenue: { rooms, services, food, tours, transport, total }, users: { total, active } }
export const getStatsOverview = async () => {
  const body = await client.get('/admin/stats/overview');
  return body.data;
};

// { year, months: [12 tháng { month, rooms, services, food, tours, transport, total }] }
export const getMonthlyRevenue = async (year) => {
  const body = await client.get('/admin/stats/revenue', { params: cleanParams({ year }) });
  return body.data;
};

// [{ room { id, room_number, room_type { id, name } }, booking_count, revenue }]
export const getTopRooms = async (limit) => {
  const body = await client.get('/admin/stats/top-rooms', { params: cleanParams({ limit }) });
  return body.data;
};

// [{ service { id, name, category }, usage_count, revenue }]; gồm dịch vụ khách sạn và vận chuyển.
export const getTopServices = async (limit) => {
  const body = await client.get('/admin/stats/top-services', { params: cleanParams({ limit }) });
  return body.data;
};

// { average_rating, review_count, by_rating { 1..5 }, by_type [{ type, average_rating, review_count }] }
export const getFeedbackStats = async () => {
  const body = await client.get('/admin/stats/feedback');
  return body.data;
};
