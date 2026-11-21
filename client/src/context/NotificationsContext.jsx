import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNotifications } from '../api/notifications.api.js';
import { UNREAD_POLL_MS } from '../config/notifications.js';
import useAuth from '../hooks/useAuth.js';
import NotificationsContext from './notificationsContext.js';

// Số thông báo chưa đọc, dùng chung cho chuông ở header (khách và admin) và trang /notifications.
// - Chỉ tải khi đã đăng nhập; đăng xuất thì về 0 và ngừng tải.
// - Tải lại: ngay sau khi đăng nhập, khi đổi trang, mỗi 60 giây khi tab đang mở (tạm dừng khi
//   document.hidden), khi tab hiện lại, và khi trang gọi refresh() hoặc setUnreadCount() sau khi đánh dấu đã đọc.
// Không dùng WebSocket.
export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { pathname } = useLocation();
  const [state, setState] = useState({ userId: null, unreadCount: 0 });

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const { unreadCount } = await getNotifications({ limit: 1 });
      setState({ userId, unreadCount });
    } catch {
      // Lỗi mạng hoặc phiên hết hạn: giữ số cũ, lần sau thử lại.
    }
  }, [userId]);

  // Đăng nhập, đổi người dùng hoặc đổi trang: tải lại. Kết quả cũ bị bỏ qua nếu đã đổi trang hoặc đăng xuất.
  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    getNotifications({ limit: 1 })
      .then(({ unreadCount }) => {
        if (active) setState({ userId, unreadCount });
      })
      .catch(() => {
        // Lỗi mạng hoặc phiên hết hạn: giữ số cũ, lần sau thử lại.
      });
    return () => {
      active = false;
    };
  }, [userId, pathname]);

  // Mỗi 60 giây khi tab đang mở; tab hiện lại thì tải ngay.
  useEffect(() => {
    if (!userId) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) refresh();
    }, UNREAD_POLL_MS);
    const handleVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [userId, refresh]);

  const setUnreadCount = useCallback(
    (unreadCount) => {
      if (userId) setState({ userId, unreadCount });
    },
    [userId],
  );

  // Số của người dùng khác (trước khi đăng xuất hoặc đổi tài khoản) không bao giờ hiện ra.
  const unreadCount = userId && state.userId === userId ? state.unreadCount : 0;

  const value = useMemo(() => ({ unreadCount, refresh, setUnreadCount }), [unreadCount, refresh, setUnreadCount]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
