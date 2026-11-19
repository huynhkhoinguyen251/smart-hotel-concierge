import { getAdminTourBookings, updateAdminTourBookingStatus } from '../../api/adminTourism.api.js';
import { GuestCell, MoneyCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import { TOURISM_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, TOUR_BOOKING_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STATUS_TABS } from '../../config/statuses.js';
import formatDate from '../../utils/formatDate.js';
import { formatParticipants } from '../../utils/tourismHelpers.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import { PaymentBadge } from '../../components/payments/PaymentInfoCard.jsx';

const itemLabel = (booking) => `tour booking #${booking.id}`;

const COLUMNS = [
  {
    key: 'booking',
    header: 'Booking',
    render: (booking) => (
      <TitleCell status={booking.status} title={`Booking #${booking.id}`} detail={`Created ${formatDate(booking.created_at)}`} />
    ),
  },
  { key: 'guest', header: 'Guest', render: (booking) => <GuestCell user={booking.user} /> },
  {
    key: 'tour',
    header: 'Tour',
    render: (booking) => (
      <>
        <p className="font-medium text-slate-900">{booking.tour.name}</p>
        <p className="text-xs text-slate-500">{booking.tour.location}</p>
      </>
    ),
  },
  {
    key: 'date',
    header: 'Tour date',
    render: (booking) => (
      <>
        <p className="whitespace-nowrap text-slate-900">{formatDate(booking.tour_date)}</p>
        <p className="text-xs text-slate-500">{formatParticipants(booking.participants)}</p>
      </>
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (booking) => <MoneyCell amount={booking.total_price} /> },
  { key: 'payment', header: 'Payment', render: (booking) => <PaymentBadge payment={booking.payment} /> },
];

// /admin/tourism: đơn tour của khách (tab "Tour bookings").
export default function AdminTourBookingsPage() {
  return (
    <AdminRequestListPage
      title="Tourism"
      subtitle="Local tour bookings and transport requests from guests."
      header={<AdminSubNav {...TOURISM_SECTION_NAV} />}
      basePath="/admin/tourism"
      statusTabs={SERVICE_REQUEST_STATUS_TABS}
      load={getAdminTourBookings}
      emptyNoun="tour bookings"
      table={{
        caption: 'Tour bookings',
        columns: COLUMNS,
        getViewPath: (booking) => `/admin/tourism/tours/${booking.id}`,
        getItemLabel: itemLabel,
        renderActions: (booking, actionProps) => (
          <AdminStatusActions
            actions={getActions(TOUR_BOOKING_ADMIN_ACTIONS, booking.status)}
            update={(action) => updateAdminTourBookingStatus(booking.id, action.status)}
            getDisabledReason={getConfirmDisabledReason(booking)}
            itemLabel={itemLabel(booking)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
