import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import RoomImage from '../rooms/RoomImage.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

// Một đơn đặt phòng trong danh sách "My bookings".
export default function BookingCard({ booking }) {
  const { room } = booking;
  const nightsLabel = `${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`;
  const guestsLabel = `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:flex-row">
      <RoomImage
        src={room.primary_image}
        alt={`${room.room_type.name}, room ${room.room_number}`}
        className="aspect-[16/9] w-full sm:aspect-auto sm:w-48 sm:shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{room.room_type.name}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            Room {room.room_number} · Booking #{booking.id}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
          </p>
          <p className="text-sm text-slate-500">
            {nightsLabel} · {guestsLabel}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
          <p className="text-lg font-bold text-teal-700">{formatCurrency(booking.total_price)}</p>
          <Link
            to={`/my-bookings/${booking.id}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
