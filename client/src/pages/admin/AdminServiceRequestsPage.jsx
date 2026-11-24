import {
  getAdminServiceBookings,
  updateAdminServiceBookingStatus,
} from '../../api/adminServiceBookings.api.js';
import AdminRequestListPage from '../../components/admin/AdminRequestListPage.jsx';
import SectionNav from '../../components/ui/SectionNav.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { BadgesCell, GuestCell, MoneyCell, StackCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import { SERVICE_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, SERVICE_REQUEST_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { HOTEL_SERVICE_CATEGORIES, HOTEL_SERVICE_CATEGORY_KEYS } from '../../config/services.js';
import { SERVICE_REQUEST_STATUS_TABS } from '../../config/statuses.js';
import formatDate from '../../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../../utils/serviceHelpers.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';

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
    render: (request, link) => (
      <TitleCell link={link} title={`Request #${request.id}`} detail={`Created ${formatDate(request.created_at)}`} />
    ),
  },
  { key: 'guest', header: 'Guest', wide: true, render: (request) => <GuestCell user={request.user} /> },
  {
    // Dòng thứ hai: loại dịch vụ. Dòng thứ ba: phòng và đơn đặt phòng (gộp vào đây để bảng vừa khung 1440px).
    key: 'service',
    header: 'Service and room',
    wide: true,
    render: (request) => (
      <>
        <StackCell main={request.service.name} detail={getCategoryLabel(request.service.category)} />
        {request.booking && (
          <p className="text-xs text-ink-soft">
            Room {request.booking.room?.room_number} · Booking #{request.booking.id}
          </p>
        )}
      </>
    ),
  },
  {
    key: 'schedule',
    header: 'Scheduled for',
    render: (request) => (
      <StackCell
        main={formatDate(request.scheduled_at, { withTime: true })}
        detail={formatQuantity(request.quantity, request.service.category)}
      />
    ),
  },
  { key: 'total', header: 'Total', align: 'right', render: (request) => <MoneyCell amount={request.total_price} /> },
  {
    key: 'status',
    header: 'Status',
    badges: true,
    render: (request) => <BadgesCell status={request.status} payment={request.payment} />,
  },
];

// /admin/services: yêu cầu dịch vụ khách sạn của khách.
export default function AdminServiceRequestsPage() {
  return (
    <AdminRequestListPage
      title="Service requests"
      subtitle="Hotel service requests from guests, newest first."
      subNav={<SectionNav {...SERVICE_SECTION_NAV} />}
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
