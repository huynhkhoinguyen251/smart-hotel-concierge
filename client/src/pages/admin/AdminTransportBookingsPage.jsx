import { getAdminTransportBookings, updateAdminTransportBookingStatus } from '../../api/adminTourism.api.js';
import { GuestCell, MoneyCell, TitleCell } from '../../components/admin/AdminCells.jsx';
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
    render: (booking) => (
      <TitleCell status={booking.status} title={`Request #${booking.id}`} detail={`Created ${formatDate(booking.created_at)}`} />
    ),
  },
  { key: 'guest', header: 'Guest', render: (booking) => <GuestCell user={booking.user} /> },
  {
    key: 'service',
    header: 'Service',
    render: (booking) => (
      <>
        <p className="font-medium text-slate-900">{booking.service.name}</p>
        <p className="text-xs text-slate-500">
          {[getTransportLabel(booking.service.category), formatTransportQuantity(booking.quantity, booking.service.category)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </>
    ),
  },
  {
    key: 'time',
    header: 'Time',
    render: (booking) => (
      <>
        <p className="text-slate-900">{formatDate(booking.start_at, { withTime: true })}</p>
        {booking.end_at && (
          <p className="text-xs text-slate-500">Return {formatDate(booking.end_at, { withTime: true })}</p>
        )}
      </>
    ),
  },
  {
    key: 'route',
    header: 'Pick-up / drop-off',
    render: (booking) => (
      <>
        <p className="text-slate-900">
          {booking.pickup_location} → {booking.dropoff_location}
        </p>
        {booking.vehicle_plate && <p className="text-xs text-slate-500">Plate {booking.vehicle_plate}</p>}
      </>
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (booking) => <MoneyCell amount={booking.total_price} /> },
];

// /admin/tourism/transport: đơn vận chuyển của khách (tab "Transport").
export default function AdminTransportBookingsPage() {
  return (
    <AdminRequestListPage
      title="Tourism"
      subtitle="Local tour bookings and transport requests from guests."
      header={<AdminSubNav {...TOURISM_SECTION_NAV} />}
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
            getExtraField={getPlateField(booking.service.category)}
            itemLabel={itemLabel(booking)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
