import { matchedData } from 'express-validator';
import * as notificationsService from '../services/notifications.service.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

// Thông báo của người đang đăng nhập (khách hoặc admin). unread_count nằm ở cấp ngoài cùng,
// cạnh data và pagination.

export const getMyNotifications = async (req, res) => {
  const { notifications, pagination, unreadCount } = await notificationsService.listMyNotifications(
    req.user.id,
    matchedData(req),
  );
  sendPaginated(res, notifications, pagination, { unread_count: unreadCount });
};

export const markAllRead = async (req, res) => {
  const { unreadCount } = await notificationsService.markAllMyNotificationsRead(req.user.id);
  sendSuccess(res, { unread_count: unreadCount }, 'All notifications marked as read', 200, {
    unread_count: unreadCount,
  });
};

export const markRead = async (req, res) => {
  const { id } = matchedData(req);
  const { notification, unreadCount } = await notificationsService.markMyNotificationRead(req.user.id, id);
  sendSuccess(res, notification, 'Notification marked as read', 200, { unread_count: unreadCount });
};
