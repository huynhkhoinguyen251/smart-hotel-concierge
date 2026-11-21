import { useContext } from 'react';
import NotificationsContext from '../context/notificationsContext.js';

// Đọc số thông báo chưa đọc: { unreadCount, refresh, setUnreadCount }.
export default function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error('useNotifications must be used inside NotificationsProvider');
  }
  return value;
}
