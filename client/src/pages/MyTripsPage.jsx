import { getMyTourBookings } from '../api/tourBookings.api.js';
import { getMyTransportBookings } from '../api/transportBookings.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import { TourBookingRow, TransportBookingRow } from '../components/orders/OrderRows.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import SectionNav from '../components/ui/SectionNav.jsx';
import { SERVICE_REQUEST_STATUS_TABS } from '../config/statuses.js';
import { TRIP_TYPE_TABS } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Mỗi loại đơn: hàm tải, tên mảng trong kết quả, dòng hiển thị và nội dung khi trống.
const TRIP_TYPES = {
  '': {
    load: getMyTourBookings,
    key: 'tourBookings',
    Row: TourBookingRow,
    listLabel: 'Tour bookings',
    emptyTitle: 'No tour bookings yet',
    emptyLabel: 'tour bookings',
    browseLink: '/tours',
    browseLabel: 'Browse tours',
  },
  transport: {
    load: getMyTransportBookings,
    key: 'transportBookings',
    Row: TransportBookingRow,
    listLabel: 'Transport requests',
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
  const config = TRIP_TYPES[type];
  const { Row } = config;
  const list = useFetch(() => config.load({ status, page, limit: PAGE_SIZE }), [type, status, page]);

  return (
    <AccountListPage
      title="My trips"
      subtitle="Your tour bookings and transport requests, newest first."
      sectionNav={
        <SectionNav
          label="Trip type"
          tabs={TRIP_TYPE_TABS.map((tab) => ({
            to: `/my-trips${toQueryString({ type: tab.value })}`,
            label: tab.label,
            match: () => tab.value === type,
          }))}
        />
      }
      tabs={{
        label: 'Filter by status',
        tabs: SERVICE_REQUEST_STATUS_TABS,
        active: status,
        getLink: (value) => `/my-trips${toQueryString({ type, status: value })}`,
      }}
      list={list}
      // Vừa đổi loại: dữ liệu cũ là của loại kia, nên mảng này chưa có và danh sách hiện khung chờ.
      items={list.data?.[config.key]}
      empty={{
        title: status ? `No ${selected.status.label.toLowerCase()} ${config.emptyLabel}` : config.emptyTitle,
        message: 'Tours and transport can be booked by any guest. No room booking is needed.',
        action: <ButtonLink to={config.browseLink}>{config.browseLabel}</ButtonLink>,
      }}
      pagination={{ page, limit: PAGE_SIZE, total: list.data?.pagination?.total ?? 0, onPageChange: goToPage }}
      listLabel={config.listLabel}
      renderItem={(booking) => <Row key={booking.id} order={booking} />}
    />
  );
}
