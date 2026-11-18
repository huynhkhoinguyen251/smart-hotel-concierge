import { Link } from 'react-router-dom';
import { getMyTourBookings } from '../api/tourBookings.api.js';
import { getMyTransportBookings } from '../api/transportBookings.api.js';
import TourBookingCard from '../components/tourism/TourBookingCard.jsx';
import TransportBookingCard from '../components/tourism/TransportBookingCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadError from '../components/ui/LoadError.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { SERVICE_REQUEST_STATUS_TABS } from '../config/statuses.js';
import { TRIP_TYPE_TABS } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Mỗi loại đơn: hàm tải, tên mảng trong kết quả, thẻ hiển thị và nội dung khi trống.
const TRIP_TYPES = {
  '': {
    load: getMyTourBookings,
    key: 'tourBookings',
    Card: TourBookingCard,
    emptyTitle: 'No tour bookings yet',
    emptyLabel: 'tour bookings',
    browseLink: '/tours',
    browseLabel: 'Browse tours',
  },
  transport: {
    load: getMyTransportBookings,
    key: 'transportBookings',
    Card: TransportBookingCard,
    emptyTitle: 'No transport requests yet',
    emptyLabel: 'transport requests',
    browseLink: '/tours?tab=transport',
    browseLabel: 'Browse transport',
  },
};

// Đơn tour và đơn vận chuyển của tôi. Loại, trạng thái và trang đều nằm trên địa chỉ trang.
export default function MyTripsPage() {
  // Giá trị lạ trên địa chỉ trang thì coi như "Tours" và "All".
  const { values, selected, page, goToPage } = useUrlFilters({
    type: TRIP_TYPE_TABS,
    status: SERVICE_REQUEST_STATUS_TABS,
  });
  const { type, status } = values;
  const activeStatus = selected.status;
  const config = TRIP_TYPES[type];

  const list = useFetch(() => config.load({ status, page, limit: PAGE_SIZE }), [type, status, page]);

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return <LoadError error={list.error} onRetry={list.retry} />;
    }
    const items = list.data[config.key];
    if (items.length === 0) {
      return (
        <EmptyState
          title={status ? `No ${activeStatus.label.toLowerCase()} ${config.emptyLabel}` : config.emptyTitle}
          message="Tours and transport can be booked by any guest. No room booking is needed."
          action={
            <Link
              to={config.browseLink}
              className="inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              {config.browseLabel}
            </Link>
          }
        />
      );
    }
    const { Card } = config;
    return (
      <>
        <div className="space-y-4">
          {items.map((booking) => (
            <Card key={booking.id} booking={booking} />
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
      <PageTitle title="My trips" subtitle="Your tour bookings and transport requests, newest first." />
      <FilterTabs
        label="Trip type"
        className="mb-3"
        tabs={TRIP_TYPE_TABS}
        active={type}
        getLink={(value) => `/my-trips${toQueryString({ type: value })}`}
      />
      <FilterTabs
        label="Filter by status"
        className="mb-6"
        tabs={SERVICE_REQUEST_STATUS_TABS}
        active={status}
        getLink={(value) => `/my-trips${toQueryString({ type, status: value })}`}
      />
      {renderList()}
    </div>
  );
}
