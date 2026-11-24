import { getMyServiceBookings } from '../api/serviceBookings.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import { ServiceRequestRow } from '../components/orders/OrderRows.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import { SERVICE_REQUEST_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import { toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Yêu cầu dịch vụ của tôi. Tab trạng thái và trang hiện tại nằm trên địa chỉ trang.
export default function MyServicesPage() {
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, selected, page, goToPage } = useUrlFilters({ status: SERVICE_REQUEST_STATUS_TABS });
  const { status } = values;
  const list = useFetch(() => getMyServiceBookings({ status, page, limit: PAGE_SIZE }), [status, page]);

  return (
    <AccountListPage
      title="My service requests"
      subtitle="Your hotel service requests, newest first."
      tabs={{
        label: 'Filter by status',
        tabs: SERVICE_REQUEST_STATUS_TABS,
        active: status,
        getLink: (value) => `/my-services${toQueryString({ status: value })}`,
      }}
      list={list}
      items={list.data?.serviceBookings}
      empty={{
        title: status ? `No ${selected.status.label.toLowerCase()} requests` : 'No service requests yet',
        message: 'When you book a hotel service, it will appear here.',
        action: <ButtonLink to="/services">Browse services</ButtonLink>,
      }}
      pagination={{ page, limit: PAGE_SIZE, total: list.data?.pagination?.total ?? 0, onPageChange: goToPage }}
      listLabel="Service requests"
      renderItem={(request) => <ServiceRequestRow key={request.id} order={request} />}
    />
  );
}
