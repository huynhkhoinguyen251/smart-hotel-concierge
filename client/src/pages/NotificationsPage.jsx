import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications.api.js';
import AdminPageHeader from '../components/admin/AdminPageHeader.jsx';
import UnreadDot from '../components/notifications/UnreadDot.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import ListPanel, { ListBody } from '../components/ui/ListPanel.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { getNotificationLabel, NOTIFICATION_TABS, NOTIFICATIONS_PAGE_SIZE } from '../config/notifications.js';
import useFetch from '../hooks/useFetch.js';
import useNotifications from '../hooks/useNotifications.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { formatShortDateTime } from '../utils/formatDate.js';
import { toQueryString } from '../utils/queryString.js';

// Một thông báo: chấm chưa đọc, tiêu đề (link tới link_path nếu có; chưa đọc thì chữ đậm),
// loại và ngày, nội dung, và nút "Mark as read".
function NotificationRow({ notification, onRead, busy }) {
  const unread = !notification.is_read;

  return (
    <li className="flex flex-wrap items-start gap-x-3 gap-y-3 p-4 sm:flex-nowrap lg:px-5">
      <UnreadDot unread={unread} className="mt-2" />
      <div className="min-w-0 flex-1 basis-60">
        <h2 className={`wrap-anywhere ${unread ? 'font-semibold' : 'font-normal'}`}>
          {notification.link_path ? (
            <Link
              to={notification.link_path}
              onClick={() => unread && onRead(notification, { silent: true })}
              className="text-sea hover:text-sea-hover hover:underline"
            >
              {notification.title}
            </Link>
          ) : (
            notification.title
          )}
        </h2>
        <p className="mt-0.5 text-sm wrap-anywhere text-ink">{notification.message}</p>
        <p className="mt-1 text-xs text-ink-soft">
          {getNotificationLabel(notification.type)} · {formatShortDateTime(notification.created_at)}
        </p>
      </div>
      {unread && (
        <Button
          size="sm"
          variant="secondary"
          className="ml-5 sm:ml-0"
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
  const items = list.data?.items;

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

  const getEmpty = () => {
    if (unreadOnly) {
      return {
        title: 'No unread notifications',
        message: 'You are all caught up.',
        action: (
          <ButtonLink to={pathname} variant="secondary">
            Show all notifications
          </ButtonLink>
        ),
      };
    }
    return {
      title: 'No notifications yet',
      message: 'Updates about your orders and requests appear here.',
      action: inAdmin ? (
        <ButtonLink to="/admin">Go to dashboard</ButtonLink>
      ) : (
        <ButtonLink to="/rooms">Find a room</ButtonLink>
      ),
    };
  };

  const header = {
    title: 'Notifications',
    subtitle: unreadCount === 0 ? 'Everything is read.' : `${unreadCount} unread`,
    action: unreadCount > 0 && (
      <Button variant="secondary" loading={busy} onClick={handleReadAll}>
        Mark all as read
      </Button>
    ),
  };

  return (
    <div className={inAdmin ? undefined : 'shell py-8 lg:py-12'}>
      {inAdmin ? <AdminPageHeader {...header} /> : <PageTitle {...header} />}
      <div className="not-empty:mb-4" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>
      <ListPanel
        tabs={
          <FilterTabs
            label="Filter notifications"
            tabs={NOTIFICATION_TABS}
            active={values.unread_only}
            getLink={(value) => `${pathname}${toQueryString({ unread_only: value })}`}
          />
        }
      >
        <ListBody
          list={list}
          items={items}
          empty={getEmpty()}
          pagination={{
            page,
            limit: NOTIFICATIONS_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <ul className="divide-y divide-line-soft" aria-label="Notifications">
            {items?.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} onRead={handleRead} busy={busy} />
            ))}
          </ul>
        </ListBody>
      </ListPanel>
    </div>
  );
}
