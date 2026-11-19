import {
  getAdminServiceBookings,
  updateAdminServiceBookingStatus,
} from '../../api/adminServiceBookings.api.js';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { GuestCell, MoneyCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import { SERVICE_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, SERVICE_REQUEST_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { HOTEL_SERVICE_CATEGORIES, HOTEL_SERVICE_CATEGORY_KEYS } from '../../config/services.js';
import { SERVICE_REQUEST_STATUS_TABS } from '../../config/statuses.js';
import formatDate from '../../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../../utils/serviceHelpers.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import { PaymentBadge } from '../../components/payments/PaymentInfoCard.jsx';

const CATEGORY_FILTER = {
  name: 'category',
  label: 'Category',
  options: [
    { value: '', label: 'All categories' },
    ...HOTEL_SERVICE_CATEGORY_KEYS.map((key) => ({ value: key, label: HOTEL_SERVICE_CATEGORIES[key].label })),
  ],
};

const itemLabel = (request) => `service request #${request.id}`;

const COLUMNS = [
  {
    key: 'request',
    header: 'Request',
    render: (request) => (
      <TitleCell status={request.status} title={`Request #${request.id}`} detail={`Created ${formatDate(request.created_at)}`} />
    ),
  },
  { key: 'guest', header: 'Guest', render: (request) => <GuestCell user={request.user} /> },
  {
    key: 'service',
    header: 'Service',
    render: (request) => (
      <>
        <p className="font-medium text-slate-900">{request.service.name}</p>
        <p className="text-xs text-slate-500">{getCategoryLabel(request.service.category)}</p>
      </>
    ),
  },
  {
    key: 'room',
    header: 'Room',
    render: (request) =>
      request.booking ? (
        <>
          <p className="text-slate-900">Room {request.booking.room?.room_number}</p>
          <p className="text-xs text-slate-500">Booking #{request.booking.id}</p>
        </>
      ) : (
        '-'
      ),
  },
  {
    key: 'schedule',
    header: 'Scheduled for',
    render: (request) => (
      <>
        <p className="whitespace-nowrap text-slate-900">{formatDate(request.scheduled_at, { withTime: true })}</p>
        <p className="text-xs text-slate-500">{formatQuantity(request.quantity, request.service.category)}</p>
      </>
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (request) => <MoneyCell amount={request.total_price} /> },
  { key: 'payment', header: 'Payment', render: (request) => <PaymentBadge payment={request.payment} /> },
];

// /admin/services: yêu cầu dịch vụ khách sạn của khách.
export default function AdminServiceRequestsPage() {
  return (
    <AdminRequestListPage
      title="Service requests"
      subtitle="Hotel service requests from guests, newest first."
      header={<AdminSubNav {...SERVICE_SECTION_NAV} />}
      basePath="/admin/services"
      statusTabs={SERVICE_REQUEST_STATUS_TABS}
      filters={[CATEGORY_FILTER]}
      load={getAdminServiceBookings}
      emptyNoun="service requests"
      table={{
        caption: 'Service requests',
        columns: COLUMNS,
        getViewPath: (request) => `/admin/services/${request.id}`,
        getItemLabel: itemLabel,
        renderActions: (request, actionProps) => (
          <AdminStatusActions
            actions={getActions(SERVICE_REQUEST_ADMIN_ACTIONS, request.status)}
            update={(action) => updateAdminServiceBookingStatus(request.id, action.status)}
            getDisabledReason={getConfirmDisabledReason(request)}
            itemLabel={itemLabel(request)}
            {...actionProps}
          />
        ),
      }}
    />
  );
}
