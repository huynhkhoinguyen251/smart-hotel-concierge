import { Link } from 'react-router-dom';
import {
  getAdminServiceBooking,
  updateAdminServiceBookingStatus,
} from '../../api/adminServiceBookings.api.js';
import AdminDetailLayout, { AdminGuestSection } from '../../components/admin/AdminDetailLayout.jsx';
import { DetailFact, DetailFacts, DetailPriceSection, DetailSection } from '../../components/detail/DetailParts.jsx';
import SectionNav from '../../components/ui/SectionNav.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
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
      subNav={<SectionNav {...SERVICE_SECTION_NAV} />}
      backTo="/admin/services"
      backLabel="Back to service requests"
      title={`Service request #${request.id}`}
      status={request.status}
      createdAt={request.created_at}
      message={message}
      steps={SERVICE_REQUEST_STEPS}
      progressLabel="Request progress"
      cancelledMessage="This service request was cancelled."
      actions={
        actions.length > 0 && (
          <AdminStatusActions
            actions={actions}
            update={(action) => updateAdminServiceBookingStatus(request.id, action.status)}
            getDisabledReason={getConfirmDisabledReason(request)}
            itemLabel={label}
            {...actionProps}
          />
        )
      }
      actionsEmptyText="No more actions for this request."
      main={
        <>
          <DetailSection title={service.name} subtitle={getCategoryLabel(service.category)}>
            <DetailFacts>
              <DetailFact label="Scheduled for">{formatDate(request.scheduled_at, { withTime: true })}</DetailFact>
              <DetailFact label="Quantity">{formatQuantity(request.quantity, service.category)}</DetailFact>
              <DetailFact label="Note">
                <span className="whitespace-pre-line">{request.note || '-'}</span>
              </DetailFact>
            </DetailFacts>
          </DetailSection>
          <DetailSection title="Room booking">
            <DetailFacts>
              <DetailFact label="Room">{booking?.room?.room_number ? `Room ${booking.room.room_number}` : '-'}</DetailFact>
              <DetailFact label="Booking">
                {booking ? (
                  <Link to={`/admin/bookings/${booking.id}`} className="text-sea hover:text-sea-hover hover:underline">
                    Booking #{booking.id}
                  </Link>
                ) : (
                  '-'
                )}
              </DetailFact>
            </DetailFacts>
          </DetailSection>
        </>
      }
      side={
        <>
          <AdminGuestSection user={request.user} />
          <DetailPriceSection
            rows={[
              { label: 'Unit price', value: formatCurrency(request.unit_price) },
              { label: 'Quantity', value: formatQuantity(request.quantity, service.category) },
            ]}
            total={request.total_price}
          />
          <PaymentInfoCard order={request} />
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
