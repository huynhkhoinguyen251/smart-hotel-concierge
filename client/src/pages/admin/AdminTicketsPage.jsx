import { getAdminTickets, updateAdminTicketStatus } from '../../api/adminTickets.api.js';
import { BadgesCell, GuestCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { getActions, TICKET_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { TICKET_STATUS_TABS } from '../../config/statuses.js';
import formatDate from '../../utils/formatDate.js';

const itemLabel = (ticket) => `support request #${ticket.id}`;
// Link của dòng là tiêu đề yêu cầu, nên nhãn đọc màn hình có cả số và tiêu đề.
const linkLabel = (ticket) => `${itemLabel(ticket)}: ${ticket.subject}`;

// Nhãn trước yêu cầu đang open, để lễ tân thấy ngay yêu cầu chưa ai trả lời.
const NewMarker = () => (
  <span className="rounded-sm bg-warning-tint px-1.5 py-0.5 text-xs font-semibold text-warning-deep">New</span>
);

const COLUMNS = [
  {
    key: 'ticket',
    header: 'Request',
    render: (ticket, link) => (
      <TitleCell
        link={link}
        title={ticket.subject}
        marker={ticket.status === 'open' ? <NewMarker /> : null}
        detail={`Request #${ticket.id}`}
      />
    ),
  },
  { key: 'guest', header: 'Guest', wide: true, render: (ticket) => <GuestCell user={ticket.guest} /> },
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
  { key: 'status', header: 'Status', badges: true, render: (ticket) => <BadgesCell status={ticket.status} /> },
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
        getItemLabel: linkLabel,
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
