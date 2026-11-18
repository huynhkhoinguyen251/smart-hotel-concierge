import { Link } from 'react-router-dom';
import { getMyServiceBookings } from '../api/serviceBookings.api.js';
import ServiceRequestCard from '../components/services/ServiceRequestCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadError from '../components/ui/LoadError.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
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
  const activeTab = selected.status;

  const list = useFetch(() => getMyServiceBookings({ status, page, limit: PAGE_SIZE }), [status, page]);

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return <LoadError error={list.error} onRetry={list.retry} />;
    }
    if (list.data.serviceBookings.length === 0) {
      return (
        <EmptyState
          title={status ? `No ${activeTab.label.toLowerCase()} requests` : 'No service requests yet'}
          message="When you book a hotel service, it will appear here."
          action={
            <Link
              to="/services"
              className="inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Browse services
            </Link>
          }
        />
      );
    }
    return (
      <>
        <div className="space-y-4">
          {list.data.serviceBookings.map((request) => (
            <ServiceRequestCard key={request.id} request={request} />
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
      <PageTitle title="My service requests" subtitle="Your hotel service requests, newest first." />
      <FilterTabs
        label="Filter by status"
        className="mb-6"
        tabs={SERVICE_REQUEST_STATUS_TABS}
        active={status}
        getLink={(value) => `/my-services${toQueryString({ status: value })}`}
      />
      {renderList()}
    </div>
  );
}
