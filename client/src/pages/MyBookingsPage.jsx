import { Link, useSearchParams } from 'react-router-dom';
import { getMyBookings } from '../api/bookings.api.js';
import BookingCard from '../components/bookings/BookingCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { BOOKING_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import { cleanParams, readPage, toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Đơn đặt phòng của tôi. Tab trạng thái và trang hiện tại nằm trên địa chỉ trang (?status=...&page=2).
export default function MyBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') ?? '';
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const activeTab = BOOKING_STATUS_TABS.find((tab) => tab.value === rawStatus) ?? BOOKING_STATUS_TABS[0];
  const status = activeTab.value;
  const page = readPage(searchParams);

  const list = useFetch(() => getMyBookings({ status, page, limit: PAGE_SIZE }), [status, page]);

  const goToPage = (nextPage) => {
    setSearchParams(cleanParams({ status, page: nextPage > 1 ? nextPage : '' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return list.error.status === 400 ? (
        <Alert type="error">{list.error.message}</Alert>
      ) : (
        <ErrorState message={list.error.message} onRetry={list.retry} />
      );
    }
    if (list.data.bookings.length === 0) {
      return (
        <EmptyState
          title={status ? `No ${activeTab.label.toLowerCase()} bookings` : 'No bookings yet'}
          message="When you book a room, it will appear here."
          action={
            <Link
              to="/rooms"
              className="inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Find a room
            </Link>
          }
        />
      );
    }
    return (
      <>
        <div className="space-y-4">
          {list.data.bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
        <Pagination
          className="mt-8"
          page={page}
          limit={PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageTitle title="My bookings" subtitle="Your room bookings, newest first." />

      {/* Trên điện thoại các tab cuộn ngang bên trong khung, trang không bị cuộn ngang. */}
      <nav aria-label="Filter by status" className="-mx-4 mb-6 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {BOOKING_STATUS_TABS.map((tab) => {
            const active = tab.value === status;
            return (
              <li key={tab.value || 'all'}>
                <Link
                  to={`/my-bookings${toQueryString({ status: tab.value })}`}
                  aria-current={active ? 'page' : undefined}
                  className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-teal-700 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {renderList()}
    </div>
  );
}
