import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notifications.api.js';
import { BELL_PREVIEW_LIMIT, formatUnreadBadge, getNotificationType } from '../../config/notifications.js';
import useNotifications from '../../hooks/useNotifications.js';
import { formatShortDateTime } from '../../utils/formatDate.js';
import Spinner from '../ui/Spinner.jsx';

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
    </svg>
  );
}

// Chuông thông báo ở header (khách) và thanh trên cùng (admin).
// Bấm mở khung 5 thông báo mới nhất; Esc hoặc bấm ra ngoài thì đóng và trả con trỏ về chuông.
// Bấm một thông báo: đánh dấu đã đọc rồi mở link_path. viewAllPath: trang xem tất cả.
// Trên điện thoại khung rộng hết màn hình, ngay dưới header.
export default function NotificationBell({ viewAllPath = '/notifications' }) {
  const { unreadCount, setUnreadCount, refresh } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState({ loading: false, items: [], error: '' });
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const load = async () => {
    setList((current) => ({ ...current, loading: true, error: '' }));
    try {
      const { notifications, unreadCount: count } = await getNotifications({ limit: BELL_PREVIEW_LIMIT });
      setList({ loading: false, items: notifications, error: '' });
      setUnreadCount(count);
    } catch (error) {
      setList({ loading: false, items: [], error: error.message });
    }
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    setOpen(true);
    load();
  };

  // Esc hoặc bấm ra ngoài thì đóng.
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      try {
        const { unreadCount: count } = await markNotificationRead(notification.id);
        setUnreadCount(count);
      } catch {
        refresh();
      }
    }
    close(false);
    if (notification.link_path) navigate(notification.link_path);
  };

  const markAll = async () => {
    try {
      setUnreadCount(await markAllNotificationsRead());
      setList((current) => ({ ...current, items: current.items.map((item) => ({ ...item, is_read: true })) }));
    } catch (error) {
      setList((current) => ({ ...current, error: error.message }));
    }
  };

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications, no unread';

  return (
    <div className="sm:relative" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white"
          >
            {formatUnreadBadge(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Latest notifications"
          className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96 sm:rounded-2xl sm:border"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAll} className="text-sm font-semibold text-teal-700 hover:text-teal-800">
                Mark all as read
              </button>
            )}
          </div>

          {list.loading && list.items.length === 0 ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : list.error ? (
            <p className="px-4 py-6 text-sm text-red-700" role="alert">
              {list.error}
            </p>
          ) : list.items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${notification.is_read ? '' : 'bg-teal-50/40'}`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? 'bg-transparent' : 'bg-teal-600'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                        <span className={`rounded px-1.5 py-0.5 font-semibold ${getNotificationType(notification.type).className}`}>
                          {getNotificationType(notification.type).label}
                        </span>
                        {formatShortDateTime(notification.created_at)}
                        {!notification.is_read && <span className="sr-only">Unread.</span>}
                      </span>
                      <span className={`mt-0.5 block text-sm break-words text-slate-900 ${notification.is_read ? '' : 'font-semibold'}`}>
                        {notification.title}
                      </span>
                      <span className="block text-sm break-words text-slate-600">{notification.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-100 px-4 py-3 text-center">
            <Link
              to={viewAllPath}
              onClick={() => close(false)}
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
