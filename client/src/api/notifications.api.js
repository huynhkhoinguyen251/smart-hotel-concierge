import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Thông báo của người đang đăng nhập (khách hoặc admin), mục 10 của docs/api.md.
// unread_count nằm ở cấp ngoài cùng của phản hồi, cạnh data và pagination.

// Mới nhất trước. unread_only: true/false. Trả { notifications, items, pagination, unreadCount }.
export const getNotifications = async ({ page, limit, unread_only } = {}) => {
  const body = await client.get('/notifications', {
    params: cleanParams({ page, limit, unread_only: unread_only ? 'true' : '' }),
  });
  return {
    notifications: body.data,
    items: body.data,
    pagination: body.pagination,
    unreadCount: body.unread_count,
  };
};

// Đánh dấu một thông báo đã đọc (gọi lại vẫn được). Trả { notification, unreadCount }.
export const markNotificationRead = async (id) => {
  const body = await client.patch(`/notifications/${id}/read`);
  return { notification: body.data, unreadCount: body.unread_count };
};

// Đánh dấu tất cả đã đọc. Trả unreadCount mới (0).
export const markAllNotificationsRead = async () => {
  const body = await client.patch('/notifications/read-all');
  return body.unread_count;
};
