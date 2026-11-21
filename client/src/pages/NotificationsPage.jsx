import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications.api.js';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import LoadError from '../components/ui/LoadError.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { getNotificationType, NOTIFICATION_TABS, NOTIFICATIONS_PAGE_SIZE } from '../config/notifications.js';
import useFetch from '../hooks/useFetch.js';
import useNotifications from '../hooks/useNotifications.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { formatShortDateTime } from '../utils/formatDate.js';
import { toQueryString } from '../utils/queryString.js';

// Một thông báo: nhãn loại, tiêu đề (link tới link_path nếu có), nội dung, ngày, chấm chưa đọc,
// và nút "Mark as read".
function NotificationRow({ notification, onRead, busy }) {
  const type = getNotificationType(notification.type);
  const unread = !notification.is_read;
  const title = (
    <span className={`break-words ${unread ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>{notification.title}</span>
  );

  return (
    <li className={`flex gap-3 rounded-2xl border p-4 ${unread ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'}`}>
      <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-teal-600' : 'bg-transparent'}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className={`rounded px-1.5 py-0.5 font-semibold ${type.className}`}>{type.label}</span>
          {formatShortDateTime(notification.created_at)}
          {unread && <span className="sr-only">Unread.</span>}
        </p>
        <p className="mt-1">
          {notification.link_path ? (
            <Link
              to={notification.link_path}
              onClick={() => unread && onRead(notification, { silent: true })}
              className="hover:text-teal-700"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </p>
        <p className="text-sm break-words text-slate-600">{notification.message}</p>
      </div>
      {unread && (
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          disabled={busy}
          aria-label={`Mark as read: ${notification.title}`}
          onClick={() => onRead(notification)}
        >
          Mark as read
        </Button>
      )}
    </li>
  );
}

// /notifications (khách) và /admin/notifications (admin): tab All / Unread và trang trên địa chỉ trang.
export default function NotificationsPage() {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith('/admin');
  const { values, page, goToPage } = useUrlFilters({ unread_only: NOTIFICATION_TABS });
  const unreadOnly = values.unread_only === 'true';
  const { unreadCount, setUnreadCount } = useNotifications();
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [busy, setBusy] = useState(false);

  const list = useFetch(
    () => getNotifications({ page, limit: NOTIFICATIONS_PAGE_SIZE, unread_only: unreadOnly }),
    ['notifications', unreadOnly ? 'unread' : 'all', page],
  );

  const handleRead = async (notification, { silent = false } = {}) => {
    setBusy(true);
    try {
      const { unreadCount: count } = await markNotificationRead(notification.id);
      setUnreadCount(count);
      if (!silent) list.retry();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const handleReadAll = async () => {
    setBusy(true);
    try {
      setUnreadCount(await markAllNotificationsRead());
      setMessage({ type: 'success', text: 'All notifications have been marked as read.' });
      list.retry();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const renderList = () => {
    if (list.loading && !list.data) return <PageSpinner />;
    if (list.error) return <LoadError error={list.error} onRetry={list.retry} />;
    if (list.data.items.length === 0) {
      return (
        <EmptyState
          title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          message={unreadOnly ? 'You are all caught up.' : 'Updates about your orders and requests appear here.'}
        />
      );
    }
    return (
      <>
        <ul className="space-y-3" aria-label="Notifications">
          {list.data.items.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} onRead={handleRead} busy={busy} />
          ))}
        </ul>
        <Pagination
          className="mt-8"
          page={page}
          limit={NOTIFICATIONS_PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className={inAdmin ? 'mx-auto max-w-4xl' : 'mx-auto max-w-4xl px-4 py-10'}>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <div className="mb-4 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Notifications</h1>
          <p className="mt-1.5 text-slate-600">{unreadCount === 0 ? 'Everything is read.' : `${unreadCount} unread`}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" className="mb-4" loading={busy} onClick={handleReadAll}>
            Mark all as read
          </Button>
        )}
      </div>
      <FilterTabs
        label="Filter notifications"
        className="mb-4"
        tabs={NOTIFICATION_TABS}
        active={values.unread_only}
        getLink={(value) => `${pathname}${toQueryString({ unread_only: value })}`}
      />
      <div className="mb-4 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      {renderList()}
    </div>
  );
}
