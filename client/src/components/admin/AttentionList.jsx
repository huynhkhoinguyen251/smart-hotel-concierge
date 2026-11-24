import { Link } from 'react-router-dom';
import { getAdminBookings } from '../../api/adminBookings.api.js';
import { getAdminFoodOrders } from '../../api/adminFoodOrders.api.js';
import { getAdminServiceBookings } from '../../api/adminServiceBookings.api.js';
import { getAdminTickets } from '../../api/adminTickets.api.js';
import { getAdminTourBookings, getAdminTransportBookings } from '../../api/adminTourism.api.js';
import useFetch from '../../hooks/useFetch.js';
import { getToday } from '../../utils/dateHelpers.js';
import { toQueryString } from '../../utils/queryString.js';
import Bone from '../ui/Bone.jsx';

// Các việc cần làm. Mỗi việc là một danh sách đã lọc: load gọi đúng API của danh sách đó với limit = 1
// để lấy tổng số, và link mở danh sách với cùng bộ lọc.
// Hôm nay tính theo giờ của máy (getToday), không dùng toISOString.
const getItems = () => {
  const today = getToday();
  const arrivals = { status: 'confirmed', check_in_from: today, check_in_to: today };
  return [
    { label: 'Bookings waiting for payment', path: '/admin/bookings', filters: { status: 'pending' }, load: getAdminBookings },
    { label: 'Arrivals today', path: '/admin/bookings', filters: arrivals, load: getAdminBookings },
    { label: 'Service requests to confirm', path: '/admin/services', filters: { status: 'pending' }, load: getAdminServiceBookings },
    { label: 'Food orders to confirm', path: '/admin/food-orders', filters: { status: 'pending' }, load: getAdminFoodOrders },
    { label: 'Tour bookings to confirm', path: '/admin/tourism', filters: { status: 'pending' }, load: getAdminTourBookings },
    { label: 'Transport requests to confirm', path: '/admin/tourism/transport', filters: { status: 'pending' }, load: getAdminTransportBookings },
    { label: 'Open support tickets', path: '/admin/tickets', filters: { status: 'open' }, load: getAdminTickets },
  ];
};

function AttentionItem({ label, path, filters, load }) {
  const to = `${path}${toQueryString(filters)}`;
  const request = useFetch(() => load({ ...filters, page: 1, limit: 1 }), [to]);

  if (request.loading) {
    return (
      <div role="status" aria-label={`Loading: ${label}`} className="flex h-12 items-center justify-between gap-4">
        <span className="text-sm text-ink-soft">{label}</span>
        <Bone className="h-5 w-8" />
      </div>
    );
  }
  if (request.error) {
    return (
      <div role="alert" className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 text-sm">
        <span className="text-ink">{label}</span>
        <span className="text-danger">
          Could not load.{' '}
          <button type="button" onClick={request.retry} className="py-1 font-semibold underline hover:no-underline">
            Try again
          </button>
        </span>
      </div>
    );
  }

  const count = request.data.pagination?.total ?? 0;
  return (
    <Link
      to={to}
      className="group flex min-h-12 items-center justify-between gap-4 text-sm focus-visible:-outline-offset-2"
    >
      <span className={`group-hover:text-sea group-hover:underline ${count > 0 ? 'font-medium text-ink' : 'text-ink-soft'}`}>
        {label}
      </span>
      <span className={count > 0 ? 'text-lg font-bold text-ink' : 'text-ink-soft'}>{count}</span>
    </Link>
  );
}

// "Needs attention": mỗi dòng tự tải và tự báo lỗi; số 0 hiện nhạt.
export default function AttentionList() {
  return (
    <ul className="grid gap-x-12 sm:grid-cols-2 xl:grid-cols-3">
      {getItems().map((item) => (
        <li key={item.label} className="border-t border-line-soft">
          <AttentionItem {...item} />
        </li>
      ))}
    </ul>
  );
}
