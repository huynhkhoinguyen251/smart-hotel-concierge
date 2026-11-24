import { getMyBookings } from '../api/bookings.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import { BookingRow } from '../components/orders/OrderRows.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import { BOOKING_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Đơn đặt phòng của tôi. Tab trạng thái và trang hiện tại nằm trên địa chỉ trang (?status=...&page=2).
export default function MyBookingsPage() {
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, selected, page, goToPage } = useUrlFilters({ status: BOOKING_STATUS_TABS });
  const { status } = values;
  const list = useFetch(() => getMyBookings({ status, page, limit: PAGE_SIZE }), [status, page]);

  return (
    <AccountListPage
      title="My bookings"
      subtitle="Your room bookings, newest first."
      tabs={{
        label: 'Filter by status',
        tabs: BOOKING_STATUS_TABS,
        active: status,
        getLink: (value) => `/my-bookings${toQueryString({ status: value })}`,
      }}
      list={list}
      items={list.data?.bookings}
      empty={{
        title: status ? `No ${selected.status.label.toLowerCase()} bookings` : 'No bookings yet',
        message: 'When you book a room, it will appear here.',
        action: <ButtonLink to="/rooms">Find a room</ButtonLink>,
      }}
      pagination={{ page, limit: PAGE_SIZE, total: list.data?.pagination?.total ?? 0, onPageChange: goToPage }}
      listLabel="Bookings"
      renderItem={(booking) => <BookingRow key={booking.id} order={booking} />}
    />
  );
}
