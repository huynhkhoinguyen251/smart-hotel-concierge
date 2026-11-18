import { getAdminTickets, updateAdminTicketStatus } from '../../api/adminTickets.api.js';
import { GuestCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { getActions, TICKET_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { TICKET_STATUS_TABS } from '../../config/statuses.js';
import formatDate from '../../utils/formatDate.js';

const itemLabel = (ticket) => `support request #${ticket.id}`;

// Chấm cam trước yêu cầu đang open, để lễ tân thấy ngay yêu cầu chưa ai trả lời.
const NewMarker = () => (
  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
    <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
    New
  </span>
);

const COLUMNS = [
  {
    key: 'ticket',
    header: 'Request',
    render: (ticket) => (
      <TitleCell
        status={ticket.status}
        title={`#${ticket.id}`}
        marker={ticket.status === 'open' ? <NewMarker /> : null}
        detail={ticket.subject}
      />
    ),
  },
  { key: 'guest', header: 'Guest', render: (ticket) => <GuestCell user={ticket.guest} /> },
  {
    key: 'messages',
    header: 'Messages',
    render: (ticket) => {
      const count = Number(ticket.message_count) || 0;
      return `${count} ${count === 1 ? 'message' : 'messages'}`;
    },
  },
  {
    key: 'updated',
    header: 'Last update',
    render: (ticket) => (
      <span className="whitespace-nowrap">
        {formatDate(ticket.last_message_at ?? ticket.updated_at, { withTime: true })}
      </span>
    ),
  },
];

// /admin/tickets: yêu cầu hỗ trợ của khách, cập nhật gần nhất trước (thứ tự của API).
export default function AdminTicketsPage() {
  return (
    <AdminRequestListPage
      title="Support requests"
      subtitle="Messages from guests, latest activity first. New requests are marked."
      basePath="/admin/tickets"
      statusTabs={TICKET_STATUS_TABS}
      load={getAdminTickets}
      emptyNoun="support requests"
      table={{
        caption: 'Support requests',
        columns: COLUMNS,
        getViewPath: (ticket) => `/admin/tickets/${ticket.id}`,
        getItemLabel: itemLabel,
        renderActions: (ticket, actionProps) => (
          <AdminStatusActions
            actions={getActions(TICKET_ADMIN_ACTIONS, ticket.status)}
            update={(action) => updateAdminTicketStatus(ticket.id, action.status)}
            itemLabel={itemLabel(ticket)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
