import { formatGuests, formatNights } from '../../utils/bookingHelpers.js';
import formatDate, { formatDateRange } from '../../utils/formatDate.js';
import AdminBookingActions from './AdminBookingActions.jsx';
import { BadgesCell, GuestCell, MoneyCell, StackCell, TitleCell } from './AdminCells.jsx';
import AdminRequestTable from './AdminRequestTable.jsx';

const COLUMNS = [
  {
    key: 'booking',
    header: 'Booking',
    render: (booking, link) => (
      <TitleCell title={`Booking #${booking.id}`} detail={`Created ${formatDate(booking.created_at)}`} link={link} />
    ),
  },
  { key: 'guest', header: 'Guest', wide: true, render: (booking) => <GuestCell user={booking.user} /> },
  {
    key: 'room',
    header: 'Room',
    render: (booking) => (
      <StackCell main={`Room ${booking.room.room_number}`} detail={booking.room.room_type.name} />
    ),
  },
  {
    key: 'stay',
    header: 'Stay',
    render: (booking) => (
      <StackCell
        main={<span className="lg:whitespace-nowrap">{formatDateRange(booking.check_in, booking.check_out)}</span>}
        detail={`${formatNights(booking.nights)} · ${formatGuests(booking.guests)}`}
      />
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (booking) => <MoneyCell amount={booking.total_price} /> },
  {
    key: 'status',
    header: 'Status',
    badges: true,
    render: (booking) => <BadgesCell status={booking.status} payment={booking.payment} />,
  },
];

// Danh sách đơn đặt phòng cho admin. actionProps: onSuccess và onError chuyển cho các nút thao tác.
export default function AdminBookingList({ bookings, actionProps }) {
  return (
    <AdminRequestTable
      caption="Bookings"
      items={bookings}
      columns={COLUMNS}
      getViewPath={(booking) => `/admin/bookings/${booking.id}`}
      getItemLabel={(booking) => `booking #${booking.id}`}
      renderActions={(booking) => <AdminBookingActions booking={booking} compact {...actionProps} />}
    />
  );
}
