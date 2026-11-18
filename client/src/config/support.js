// Yêu cầu hỗ trợ (mục 7 của docs/api.md). Giới hạn giống backend (server/src/config/tickets.js).

export const TICKET_SUBJECT_MAX_LENGTH = 200;
export const TICKET_MESSAGE_MAX_LENGTH = 2000;

// Yêu cầu ở trạng thái này không nhận thêm tin nhắn.
export const CLOSED_TICKET_STATUS = 'resolved';

export const TICKET_CREATED_MESSAGE = 'Your request has been sent. Reception will reply soon.';
export const TICKET_RESOLVED_NOTE =
  'This request is resolved. Create a new request if you need more help.';
export const ADMIN_TICKET_NOTE = 'Admin accounts cannot create support requests.';
// Nhãn của tin nhắn do admin (lễ tân) gửi.
export const RECEPTION_LABEL = 'Reception';
