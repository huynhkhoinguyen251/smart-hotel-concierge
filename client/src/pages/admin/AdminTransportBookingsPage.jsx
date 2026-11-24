import { ArrowRightOutlined } from '@ant-design/icons';
import { getAdminTransportBookings, updateAdminTransportBookingStatus } from '../../api/adminTourism.api.js';
import { BadgesCell, GuestCell, MoneyCell, StackCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import { TOURISM_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, TRANSPORT_BOOKING_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STATUS_TABS } from '../../config/statuses.js';
import { TRANSPORT_CATEGORIES, TRANSPORT_CATEGORY_KEYS } from '../../config/tourism.js';
import formatDate from '../../utils/formatDate.js';
import { formatTransportQuantity, getTransportLabel } from '../../utils/tourismHelpers.js';
import { getPlateField } from '../../utils/vehiclePlate.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';

const CATEGORY_FILTER = {
  name: 'category',
  label: 'Type',
  options: [
    { value: '', label: 'All types' },
    ...TRANSPORT_CATEGORY_KEYS.map((key) => ({ value: key, label: TRANSPORT_CATEGORIES[key].label })),
  ],
};

const itemLabel = (booking) => `transport request #${booking.id}`;

const COLUMNS = [
  {
    key: 'request',
    header: 'Request',
    render: (booking, link) => (
      <TitleCell link={link} title={`Request #${booking.id}`} detail={`Created ${formatDate(booking.created_at)}`} />
    ),
  },
  { key: 'guest', header: 'Guest', wide: true, render: (booking) => <GuestCell user={booking.user} /> },
  {
    key: 'service',
    header: 'Service',
    render: (booking) => (
      <StackCell
        main={booking.service.name}
        detail={[
          getTransportLabel(booking.service.category),
          formatTransportQuantity(booking.quantity, booking.service.category),
        ]
          .filter(Boolean)
          .join(' · ')}
      />
    ),
  },
  {
    key: 'time',
    header: 'Time',
    render: (booking) => (
      <StackCell
        main={formatDate(booking.start_at, { withTime: true })}
        detail={booking.end_at && `Return ${formatDate(booking.end_at, { withTime: true })}`}
      />
    ),
  },
  {
    key: 'route',
    wide: true,
    header: 'Pick-up / drop-off',
    render: (booking) => (
      <StackCell
        main={
          <>
            {booking.pickup_location} <ArrowRightOutlined aria-hidden="true" className="text-xs text-ink-soft" />
            <span className="sr-only">to</span> {booking.dropoff_location}
          </>
        }
        detail={booking.vehicle_plate && `Plate ${booking.vehicle_plate}`}
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

// /admin/tourism/transport: đơn vận chuyển của khách (tab "Transport").
export default function AdminTransportBookingsPage() {
  return (
    <AdminRequestListPage
      title="Tourism"
      subtitle="Local tour bookings and transport requests from guests."
      subNav={<AdminSubNav {...TOURISM_SECTION_NAV} />}
      basePath="/admin/tourism/transport"
      statusTabs={SERVICE_REQUEST_STATUS_TABS}
      filters={[CATEGORY_FILTER]}
      load={getAdminTransportBookings}
      emptyNoun="transport requests"
      table={{
        caption: 'Transport requests',
        columns: COLUMNS,
        getViewPath: (booking) => `/admin/tourism/transport/${booking.id}`,
        getItemLabel: itemLabel,
        renderActions: (booking, actionProps) => (
          <AdminStatusActions
            actions={getActions(TRANSPORT_BOOKING_ADMIN_ACTIONS, booking.status)}
            update={(action, plate) => updateAdminTransportBookingStatus(booking.id, action.status, plate)}
            getDisabledReason={getConfirmDisabledReason(booking)}
            getExtraField={getPlateField(booking.service.category)}
            itemLabel={itemLabel(booking)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
