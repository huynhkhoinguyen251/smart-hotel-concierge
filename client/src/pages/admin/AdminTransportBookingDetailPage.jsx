import { getAdminTransportBooking, updateAdminTransportBookingStatus } from '../../api/adminTourism.api.js';
import AdminDetailLayout, { AdminActionsCard, AdminGuestCard } from '../../components/admin/AdminDetailLayout.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import { TOURISM_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, PLATE_REQUIRED_CATEGORIES, TRANSPORT_BOOKING_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STEPS } from '../../config/statuses.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import {
  formatDays,
  formatTransportQuantity,
  getRentalDays,
  getTransportCategory,
  getTransportLabel,
} from '../../utils/tourismHelpers.js';
import { getPlateField } from '../../utils/vehiclePlate.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';

const GENERIC_FIELDS = { start: 'Start time', end: 'End time', pickup: 'Pick-up location', dropoff: 'Drop-off location' };

function TransportDetails({ initialBooking }) {
  const { item: booking, message, actionProps } = useAdminItem(initialBooking);
  const { service } = booking;
  const category = getTransportCategory(service.category);
  const fields = category?.fields ?? GENERIC_FIELDS;
  const isMotorbike = service.category === 'motorbike_rental';
  const rentalDays = isMotorbike ? getRentalDays(booking.start_at, booking.end_at) : 0;
  const quantityText = formatTransportQuantity(booking.quantity, service.category);
  const actions = getActions(TRANSPORT_BOOKING_ADMIN_ACTIONS, booking.status);
  const plateRequired = PLATE_REQUIRED_CATEGORIES.includes(service.category);

  return (
    <AdminDetailLayout
      subNav={<AdminSubNav {...TOURISM_SECTION_NAV} />}
      backTo="/admin/tourism/transport"
      backLabel="Back to transport requests"
      title={`Transport request #${booking.id}`}
      status={booking.status}
      createdAt={booking.created_at}
      createdLabel="Requested on"
      message={message}
      steps={SERVICE_REQUEST_STEPS}
      progressLabel="Request progress"
      cancelledMessage="This transport request was cancelled."
      main={
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {getTransportLabel(service.category)}
          </p>
          <h2 className="mt-1 text-xl font-semibold break-words text-slate-900">{service.name}</h2>
          <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            {booking.flight_number && <DetailRow label="Flight number">{booking.flight_number}</DetailRow>}
            <DetailRow label={fields.start}>{formatDate(booking.start_at, { withTime: true })}</DetailRow>
            {booking.end_at && (
              <DetailRow label={fields.end ?? 'End time'}>{formatDate(booking.end_at, { withTime: true })}</DetailRow>
            )}
            {isMotorbike && <DetailRow label="Rental days">{rentalDays ? formatDays(rentalDays) : '-'}</DetailRow>}
            {quantityText && <DetailRow label={category.quantity.label}>{quantityText}</DetailRow>}
            <DetailRow label={fields.pickup}>{booking.pickup_location}</DetailRow>
            <DetailRow label={fields.dropoff}>{booking.dropoff_location}</DetailRow>
            <DetailRow label="Licence plate">
              {booking.vehicle_plate ||
                (plateRequired && booking.status === 'pending' ? 'Entered when you confirm' : '-')}
            </DetailRow>
            <DetailRow label="Note">
              <span className="whitespace-pre-line">{booking.note || '-'}</span>
            </DetailRow>
          </dl>
        </Card>
      }
      side={
        <>
          <AdminGuestCard user={booking.user} />
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Unit price">
                {formatCurrency(booking.unit_price)} {category?.priceUnit ?? ''}
              </DetailRow>
              <DetailRow label={isMotorbike ? 'Rental days' : 'Quantity'}>
                {isMotorbike ? formatDays(rentalDays) : quantityText || booking.quantity}
              </DetailRow>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">{formatCurrency(booking.total_price)}</dd>
              </div>
            </dl>
          </Card>
          <PaymentInfoCard order={booking} />
          <AdminActionsCard emptyText="No more actions for this request.">
            {actions.length > 0 && (
              <AdminStatusActions
                actions={actions}
                update={(action, plate) => updateAdminTransportBookingStatus(booking.id, action.status, plate)}
                getDisabledReason={getConfirmDisabledReason(booking)}
                getExtraField={getPlateField(service.category)}
                itemLabel={`transport request #${booking.id}`}
                {...actionProps}
              />
            )}
          </AdminActionsCard>
        </>
      }
    />
  );
}

// /admin/tourism/transport/:id
export default function AdminTransportBookingDetailPage() {
  return (
    <DetailLoader
      load={getAdminTransportBooking}
      notFound={{
        title: 'Transport request not found',
        message: 'This transport request does not exist.',
        to: '/admin/tourism/transport',
        linkLabel: 'Back to transport requests',
      }}
    >
      {(data) => <TransportDetails key={data.id} initialBooking={data} />}
    </DetailLoader>
  );
}
