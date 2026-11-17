import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { formatTransportQuantity, getTransportLabel } from '../../utils/tourismHelpers.js';
import StatusBadge from '../ui/StatusBadge.jsx';

// Một đơn vận chuyển trong trang "My trips".
export default function TransportBookingCard({ booking }) {
  const { service } = booking;
  const isMotorbike = service.category === 'motorbike_rental';
  const quantityText = formatTransportQuantity(booking.quantity, service.category);
  const time = formatDate(booking.start_at, { withTime: true });

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold break-words text-slate-900">{service.name}</h3>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          {getTransportLabel(service.category)} · Request #{booking.id}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {isMotorbike && booking.end_at
            ? `${time} to ${formatDate(booking.end_at, { withTime: true })}`
            : time}
        </p>
        <p className="text-sm break-words text-slate-500">
          {booking.pickup_location} → {booking.dropoff_location}
        </p>
        {(quantityText || booking.vehicle_plate) && (
          <p className="text-sm text-slate-500">
            {[quantityText, booking.vehicle_plate && `Licence plate ${booking.vehicle_plate}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
        <p className="text-lg font-bold text-teal-700">{formatCurrency(booking.total_price)}</p>
        <Link
          to={`/my-trips/transport/${booking.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
