import { Link } from 'react-router-dom';
import formatDate from '../../utils/formatDate.js';
import StatusBadge from '../ui/StatusBadge.jsx';

// Một yêu cầu hỗ trợ trong trang "Support".
export default function TicketCard({ ticket }) {
  const count = Number(ticket.message_count) || 0;
  const lastUpdate = ticket.last_message_at ?? ticket.updated_at;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold wrap-anywhere text-slate-900">{ticket.subject}</h3>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          Request #{ticket.id} · {count} {count === 1 ? 'message' : 'messages'}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Last update: {formatDate(lastUpdate, { withTime: true })}
        </p>
      </div>

      <Link
        to={`/support/${ticket.id}`}
        className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 md:self-center"
      >
        View conversation
      </Link>
    </article>
  );
}
