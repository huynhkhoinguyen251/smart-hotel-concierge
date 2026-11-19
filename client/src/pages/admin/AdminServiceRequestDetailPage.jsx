import { Link } from 'react-router-dom';
import {
  getAdminServiceBooking,
  updateAdminServiceBookingStatus,
} from '../../api/adminServiceBookings.api.js';
import AdminDetailLayout, { AdminActionsCard, AdminGuestCard } from '../../components/admin/AdminDetailLayout.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import { SERVICE_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, SERVICE_REQUEST_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STEPS } from '../../config/statuses.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../../utils/serviceHelpers.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';

function ServiceRequestDetails({ initialRequest }) {
  const { item: request, message, actionProps } = useAdminItem(initialRequest);
  const { service, booking } = request;
  const actions = getActions(SERVICE_REQUEST_ADMIN_ACTIONS, request.status);
  const label = `service request #${request.id}`;

  return (
    <AdminDetailLayout
      subNav={<AdminSubNav {...SERVICE_SECTION_NAV} />}
      backTo="/admin/services"
      backLabel="Back to service requests"
      title={`Service request #${request.id}`}
      status={request.status}
      createdAt={request.created_at}
      message={message}
      steps={SERVICE_REQUEST_STEPS}
      progressLabel="Request progress"
      cancelledMessage="This service request was cancelled."
      main={
        <>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {getCategoryLabel(service.category)}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{service.name}</h2>
            <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
              <DetailRow label="Scheduled for">{formatDate(request.scheduled_at, { withTime: true })}</DetailRow>
              <DetailRow label="Quantity">{formatQuantity(request.quantity, service.category)}</DetailRow>
              <DetailRow label="Note">
                <span className="whitespace-pre-line">{request.note || '-'}</span>
              </DetailRow>
            </dl>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Room booking</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Room">{booking?.room?.room_number ? `Room ${booking.room.room_number}` : '-'}</DetailRow>
              <DetailRow label="Booking">
                {booking ? (
                  <Link to={`/admin/bookings/${booking.id}`} className="text-teal-700 hover:text-teal-800">
                    Booking #{booking.id}
                  </Link>
                ) : (
                  '-'
                )}
              </DetailRow>
            </dl>
          </Card>
        </>
      }
      side={
        <>
          <AdminGuestCard user={request.user} />
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Unit price">{formatCurrency(request.unit_price)}</DetailRow>
              <DetailRow label="Quantity">{formatQuantity(request.quantity, service.category)}</DetailRow>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">{formatCurrency(request.total_price)}</dd>
              </div>
            </dl>
          </Card>
          <PaymentInfoCard order={request} />
          <AdminActionsCard emptyText="No more actions for this request.">
            {actions.length > 0 && (
              <AdminStatusActions
                actions={actions}
                update={(action) => updateAdminServiceBookingStatus(request.id, action.status)}
                getDisabledReason={getConfirmDisabledReason(request)}
                itemLabel={label}
                {...actionProps}
              />
            )}
          </AdminActionsCard>
        </>
      }
    />
  );
}

// /admin/services/:id
export default function AdminServiceRequestDetailPage() {
  return (
    <DetailLoader
      load={getAdminServiceBooking}
      notFound={{
        title: 'Service request not found',
        message: 'This service request does not exist.',
        to: '/admin/services',
        linkLabel: 'Back to service requests',
      }}
    >
      {(data) => <ServiceRequestDetails key={data.id} initialRequest={data} />}
    </DetailLoader>
  );
}
