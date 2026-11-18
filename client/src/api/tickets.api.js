import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Tạo yêu cầu hỗ trợ kèm tin nhắn đầu tiên. Trả yêu cầu vừa tạo (có messages).
export const createTicket = async ({ subject, message }) => {
  const body = await client.post('/tickets', { subject, message });
  return body.data;
};

// Yêu cầu của tôi, cập nhật gần nhất trước. Trả { tickets, pagination }.
export const getMyTickets = async ({ status, page, limit } = {}) => {
  const body = await client.get('/tickets', { params: cleanParams({ status, page, limit }) });
  return { tickets: body.data, pagination: body.pagination };
};

// Chi tiết kèm messages (cũ nhất trước).
export const getTicket = async (id) => {
  const body = await client.get(`/tickets/${id}`);
  return body.data;
};

// Gửi thêm tin nhắn; không gửi được khi yêu cầu đã resolved. Trả lại cả yêu cầu (có messages).
export const sendTicketMessage = async (id, message) => {
  const body = await client.post(`/tickets/${id}/messages`, { message });
  return body.data;
};
