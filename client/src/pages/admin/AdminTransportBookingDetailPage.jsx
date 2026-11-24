import { getAdminTransportBooking, updateAdminTransportBookingStatus } from '../../api/adminTourism.api.js';
import AdminDetailLayout, {
  AdminFact,
  AdminFacts,
  AdminGuestSection,
  AdminPriceSection,
  AdminSection,
} from '../../components/admin/AdminDetailLayout.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
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
      actions={
        actions.length > 0 && (
          <AdminStatusActions
            actions={actions}
            update={(action, plate) => updateAdminTransportBookingStatus(booking.id, action.status, plate)}
            getDisabledReason={getConfirmDisabledReason(booking)}
            getExtraField={getPlateField(service.category)}
            itemLabel={`transport request #${booking.id}`}
            {...actionProps}
          />
        )
      }
      actionsEmptyText="No more actions for this request."
      main={
        <AdminSection title={service.name} subtitle={getTransportLabel(service.category)}>
          <AdminFacts>
            {booking.flight_number && <AdminFact label="Flight number">{booking.flight_number}</AdminFact>}
            <AdminFact label={fields.start}>{formatDate(booking.start_at, { withTime: true })}</AdminFact>
            {booking.end_at && (
              <AdminFact label={fields.end ?? 'End time'}>{formatDate(booking.end_at, { withTime: true })}</AdminFact>
            )}
            {isMotorbike && <AdminFact label="Rental days">{rentalDays ? formatDays(rentalDays) : '-'}</AdminFact>}
            {quantityText && <AdminFact label={category.quantity.label}>{quantityText}</AdminFact>}
            <AdminFact label={fields.pickup}>{booking.pickup_location}</AdminFact>
            <AdminFact label={fields.dropoff}>{booking.dropoff_location}</AdminFact>
            <AdminFact label="Licence plate">
              {booking.vehicle_plate ||
                (plateRequired && booking.status === 'pending' ? 'Entered when you confirm' : '-')}
            </AdminFact>
            <AdminFact label="Note">
              <span className="whitespace-pre-line">{booking.note || '-'}</span>
            </AdminFact>
          </AdminFacts>
        </AdminSection>
      }
      side={
        <>
          <AdminGuestSection user={booking.user} />
          <AdminPriceSection
            rows={[
              {
                label: 'Unit price',
                value: `${formatCurrency(booking.unit_price)} ${category?.priceUnit ?? ''}`.trim(),
              },
              isMotorbike
                ? { label: 'Rental days', value: formatDays(rentalDays) }
                : { label: 'Quantity', value: quantityText || booking.quantity },
            ]}
            total={booking.total_price}
          />
          <PaymentInfoCard order={booking} />
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
