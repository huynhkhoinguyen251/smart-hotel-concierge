import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate, { formatDateRange } from '../../utils/formatDate.js';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatGuests, formatNights } from '../../utils/bookingHelpers.js';
import AdminBookingActions from './AdminBookingActions.jsx';

const VIEW_LINK =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50';

// Danh sách đơn cho admin. Màn hình rộng (xl): bảng; nhỏ hơn: thẻ xếp dọc, nên ở 375px
// trang không bị cuộn ngang. actionProps: onSuccess và onError chuyển cho các nút thao tác.
export default function AdminBookingList({ bookings, actionProps }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm xl:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Bookings</caption>
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Booking</th>
              <th scope="col" className="px-4 py-3 font-medium">Guest</th>
              <th scope="col" className="px-4 py-3 font-medium">Room</th>
              <th scope="col" className="px-4 py-3 font-medium">Stay</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">#{booking.id}</p>
                  <p className="text-xs text-slate-500">{formatDate(booking.created_at)}</p>
                </td>
                <td className="max-w-48 px-4 py-3">
                  <p className="font-medium break-words text-slate-900">{booking.user?.full_name}</p>
                  <p className="text-xs break-all text-slate-500">{booking.user?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">Room {booking.room.room_number}</p>
                  <p className="text-xs text-slate-500">{booking.room.room_type.name}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-slate-900">{formatDateRange(booking.check_in, booking.check_out)}</p>
                  <p className="text-xs text-slate-500">
                    {formatNights(booking.nights)} · {formatGuests(booking.guests)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-slate-900">
                  {formatCurrency(booking.total_price)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/bookings/${booking.id}`} className={VIEW_LINK} aria-label={`View booking #${booking.id}`}>
                      View
                    </Link>
                    <AdminBookingActions booking={booking} compact {...actionProps} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 xl:hidden">
        {bookings.map((booking) => (
          <li key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">
                Booking #{booking.id} <StatusBadge status={booking.status} className="ml-1" />
              </p>
              <p className="text-xs text-slate-500">Created {formatDate(booking.created_at)}</p>
            </div>
            <p className="mt-2 text-sm font-medium break-words text-slate-900">{booking.user?.full_name}</p>
            <p className="text-xs break-all text-slate-500">{booking.user?.email}</p>
            <p className="mt-2 text-sm text-slate-700">
              Room {booking.room.room_number} · {booking.room.room_type.name}
            </p>
            <p className="text-sm text-slate-700">
              {formatDateRange(booking.check_in, booking.check_out)} · {formatNights(booking.nights)} ·{' '}
              {formatGuests(booking.guests)}
            </p>
            <p className="mt-1 font-semibold text-teal-700">{formatCurrency(booking.total_price)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <Link to={`/admin/bookings/${booking.id}`} className={VIEW_LINK} aria-label={`View booking #${booking.id}`}>
                View
              </Link>
              <AdminBookingActions booking={booking} compact {...actionProps} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
