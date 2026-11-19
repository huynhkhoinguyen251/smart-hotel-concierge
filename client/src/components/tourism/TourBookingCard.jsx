import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { formatParticipants } from '../../utils/tourismHelpers.js';
import StatusBadge from '../ui/StatusBadge.jsx';
import AwaitingPaymentNote from '../payments/AwaitingPaymentNote.jsx';

// Một đơn tour trong trang "My trips".
export default function TourBookingCard({ booking }) {
  const { tour } = booking;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold break-words text-slate-900">{tour.name}</h3>
          <StatusBadge status={booking.status} />
        </div>
        <AwaitingPaymentNote order={booking} to={`/my-trips/tours/${booking.id}`} />
        <p className="mt-0.5 text-sm text-slate-500">
          {tour.location} · {tour.duration} · Booking #{booking.id}
        </p>
        <p className="mt-2 text-sm text-slate-700">{formatDate(booking.tour_date)}</p>
        <p className="text-sm text-slate-500">{formatParticipants(booking.participants)}</p>
      </div>

      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
        <p className="text-lg font-bold text-teal-700">{formatCurrency(booking.total_price)}</p>
        <Link
          to={`/my-trips/tours/${booking.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
