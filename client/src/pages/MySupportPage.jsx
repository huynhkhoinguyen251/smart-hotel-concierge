import { useSearchParams } from 'react-router-dom';
import { getMyTickets } from '../api/tickets.api.js';
import NewRequestLink from '../components/support/NewRequestLink.jsx';
import TicketCard from '../components/support/TicketCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { TICKET_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import { cleanParams, readPage, toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// /support: yêu cầu hỗ trợ của tôi, cập nhật gần nhất trước. Tab trạng thái và trang nằm trên địa chỉ trang.
export default function MySupportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') ?? '';
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const activeTab = TICKET_STATUS_TABS.find((tab) => tab.value === rawStatus) ?? TICKET_STATUS_TABS[0];
  const status = activeTab.value;
  const page = readPage(searchParams);

  const list = useFetch(() => getMyTickets({ status, page, limit: PAGE_SIZE }), [status, page]);

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
    if (list.data.tickets.length === 0) {
      return (
        <EmptyState
          title={status ? `No ${activeTab.label.toLowerCase()} requests` : 'No support requests yet'}
          message="Send a message to reception if you need help with your stay or a booking."
          action={<NewRequestLink />}
        />
      );
    }
    return (
      <>
        <div className="space-y-4">
          {list.data.tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Support</h1>
          <p className="mt-1.5 text-slate-600">Your messages with reception, latest activity first.</p>
        </div>
        <NewRequestLink />
      </div>
      <FilterTabs
        label="Filter by status"
        className="mb-6"
        tabs={TICKET_STATUS_TABS}
        active={status}
        getLink={(value) => `/support${toQueryString({ status: value })}`}
      />
      {renderList()}
    </div>
  );
}
