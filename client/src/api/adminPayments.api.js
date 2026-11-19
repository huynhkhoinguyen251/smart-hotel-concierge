import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Thanh toán (admin). Lọc bằng status (unpaid, paid, refunded) và type (room, service, food_order,
// tour, transport). Mỗi thanh toán có thêm user. Trả { payments, items, pagination }.
export const getAdminPayments = async (params = {}) => {
  const body = await client.get('/admin/payments', { params: cleanParams(params) });
  return { payments: body.data, items: body.data, pagination: body.pagination };
};

// Chỉ được khi thanh toán paid và đơn đã cancelled; nếu không thì 400.
export const refundAdminPayment = async (id) => {
  const body = await client.patch(`/admin/payments/${id}/refund`);
  return body.data;
};
