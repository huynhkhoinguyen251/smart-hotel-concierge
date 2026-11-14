import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../../utils/serviceHelpers.js';
import StatusBadge from '../ui/StatusBadge.jsx';

// Một yêu cầu dịch vụ trong danh sách "My service requests".
export default function ServiceRequestCard({ request }) {
  const { service, booking } = request;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
          <StatusBadge status={request.status} />
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          {getCategoryLabel(service.category)} · Room {booking.room.room_number} · Request #
          {request.id}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {formatDate(request.scheduled_at, { withTime: true })}
        </p>
        <p className="text-sm text-slate-500">{formatQuantity(request.quantity, service.category)}</p>
      </div>

      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
        <p className="text-lg font-bold text-teal-700">{formatCurrency(request.total_price)}</p>
        <Link
          to={`/my-services/${request.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
