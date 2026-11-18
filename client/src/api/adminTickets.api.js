import client from './client.js';
import { makeAdminResource } from './adminResource.js';

// Yêu cầu hỗ trợ (admin). Danh sách sắp theo lần cập nhật gần nhất; chi tiết có messages và guest.
const resource = makeAdminResource('/admin/tickets', 'tickets');

export const getAdminTickets = resource.list;
export const getAdminTicket = resource.get;
export const updateAdminTicketStatus = (id, status) => resource.updateStatus(id, { status });

// Trả lời khách. Yêu cầu đang open tự chuyển sang in_progress. Trả lại cả yêu cầu (có messages).
export const replyToAdminTicket = async (id, message) => {
  const body = await client.post(`/admin/tickets/${id}/messages`, { message });
  return body.data;
};
