import { getAdminTourBookings, updateAdminTourBookingStatus } from '../../api/adminTourism.api.js';
import { BadgesCell, GuestCell, MoneyCell, StackCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import { TOURISM_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, TOUR_BOOKING_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STATUS_TABS } from '../../config/statuses.js';
import formatDate from '../../utils/formatDate.js';
import { formatParticipants } from '../../utils/tourismHelpers.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';

const itemLabel = (booking) => `tour booking #${booking.id}`;

const COLUMNS = [
  {
    key: 'booking',
    header: 'Booking',
    render: (booking, link) => (
      <TitleCell link={link} title={`Booking #${booking.id}`} detail={`Created ${formatDate(booking.created_at)}`} />
    ),
  },
  { key: 'guest', header: 'Guest', wide: true, render: (booking) => <GuestCell user={booking.user} /> },
  {
    key: 'tour',
    header: 'Tour',
    render: (booking) => (
      <StackCell main={booking.tour.name} detail={booking.tour.location} />
    ),
  },
  {
    key: 'date',
    header: 'Tour date',
    render: (booking) => (
      <StackCell main={formatDate(booking.tour_date)} detail={formatParticipants(booking.participants)} />
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

// /admin/tourism: đơn tour của khách (tab "Tour bookings").
export default function AdminTourBookingsPage() {
  return (
    <AdminRequestListPage
      title="Tourism"
      subtitle="Local tour bookings and transport requests from guests."
      subNav={<AdminSubNav {...TOURISM_SECTION_NAV} />}
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
