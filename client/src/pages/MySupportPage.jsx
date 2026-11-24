import { getMyTickets } from '../api/tickets.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import RowLink from '../components/ui/RowLink.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { TICKET_STATUS_TABS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import formatDate from '../utils/formatDate.js';
import { toQueryString } from '../utils/queryString.js';

const PAGE_SIZE = 10;

// Một yêu cầu hỗ trợ: bấm đâu trong dòng cũng mở cuộc hội thoại.
function TicketRow({ ticket }) {
  const count = Number(ticket.message_count) || 0;
  const lastUpdate = ticket.last_message_at ?? ticket.updated_at;

  return (
    <li className="group relative p-4 transition-colors duration-150 hover:bg-ground lg:px-5 lg:py-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 className="min-w-0 text-lg font-semibold wrap-anywhere">
          <RowLink to={`/support/${ticket.id}`}>{ticket.subject}</RowLink>
        </h2>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="mt-0.5 text-sm text-ink-soft">
        Request #{ticket.id} · {count} {count === 1 ? 'message' : 'messages'}
      </p>
      <p className="mt-2 text-sm text-ink">Last update: {formatDate(lastUpdate, { withTime: true })}</p>
    </li>
  );
}

// /support: yêu cầu hỗ trợ của tôi, cập nhật gần nhất trước. Tab trạng thái và trang nằm trên địa chỉ trang.
export default function MySupportPage() {
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, selected, page, goToPage } = useUrlFilters({ status: TICKET_STATUS_TABS });
  const { status } = values;
  const list = useFetch(() => getMyTickets({ status, page, limit: PAGE_SIZE }), [status, page]);

  return (
    <AccountListPage
      title="Support"
      subtitle="Your messages with reception, latest activity first."
      action={<ButtonLink to="/support/new">New request</ButtonLink>}
      tabs={{
        label: 'Filter by status',
        tabs: TICKET_STATUS_TABS,
        active: status,
        getLink: (value) => `/support${toQueryString({ status: value })}`,
      }}
      list={list}
      items={list.data?.tickets}
      empty={{
        title: status ? `No ${selected.status.label.toLowerCase()} requests` : 'No support requests yet',
        message: 'Send a message to reception if you need help with your stay or a booking.',
        // Nút vàng của trang là "New request" ở đầu trang.
        action: (
          <ButtonLink to="/support/new" variant="secondary">
            New request
          </ButtonLink>
        ),
      }}
      pagination={{ page, limit: PAGE_SIZE, total: list.data?.pagination?.total ?? 0, onPageChange: goToPage }}
      listLabel="Support requests"
      renderItem={(ticket) => <TicketRow key={ticket.id} ticket={ticket} />}
    />
  );
}
