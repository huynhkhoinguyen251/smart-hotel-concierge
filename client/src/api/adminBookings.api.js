import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Quản lý đơn đặt phòng (admin). Đơn có thêm user { id, full_name, email }.

// Lọc bằng status, room_id, user_id, check_in_from, check_in_to (YYYY-MM-DD). Trả { bookings, pagination }.
export const getAdminBookings = async (params = {}) => {
  const body = await client.get('/admin/bookings', { params: cleanParams(params) });
  return { bookings: body.data, pagination: body.pagination };
};

export const getAdminBooking = async (id) => {
  const body = await client.get(`/admin/bookings/${id}`);
  return body.data;
};

// Đổi trạng thái theo luồng; sai luồng hoặc check-in trước ngày nhận phòng thì backend trả 400.
// Hủy đơn cũng hủy các yêu cầu dịch vụ pending/confirmed của đơn đó. Trả đơn sau khi đổi.
export const updateAdminBookingStatus = async (id, status) => {
  const body = await client.patch(`/admin/bookings/${id}/status`, { status });
  return body.data;
};
