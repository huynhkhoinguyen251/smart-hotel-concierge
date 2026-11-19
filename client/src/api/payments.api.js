import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Thanh toán QR giả lập của khách (mục 11 của docs/api.md).

// "I have paid". body: { method: 'e_wallet', <khóa đơn>: id } (xem toPaymentBody).
// Lỗi: 400 hết hạn hoặc đơn không còn pending, 403, 404, 409 đã trả. Trả thanh toán sau khi trả.
export const payOrder = async (body) => {
  const res = await client.post('/payments', body);
  return res.data;
};

// Thanh toán của tôi, mới nhất trước. Trả { payments, items, pagination }.
export const getMyPayments = async ({ page, limit } = {}) => {
  const body = await client.get('/payments', { params: cleanParams({ page, limit }) });
  return { payments: body.data, items: body.data, pagination: body.pagination };
};

export const getMyPayment = async (id) => {
  const body = await client.get(`/payments/${id}`);
  return body.data;
};

// Hóa đơn; chưa thanh toán thì 404.
export const getInvoice = async (paymentId) => {
  const body = await client.get(`/payments/${paymentId}/invoice`);
  return body.data;
};
