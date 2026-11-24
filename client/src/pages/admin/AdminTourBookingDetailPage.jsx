import { getAdminTourBooking, updateAdminTourBookingStatus } from '../../api/adminTourism.api.js';
import AdminDetailLayout, { AdminGuestSection } from '../../components/admin/AdminDetailLayout.jsx';
import { DetailFact, DetailFacts, DetailPriceSection, DetailSection } from '../../components/detail/DetailParts.jsx';
import SectionNav from '../../components/ui/SectionNav.jsx';
import MoreLink from '../../components/ui/MoreLink.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import { TOURISM_SECTION_NAV } from '../../config/adminCatalog.js';
import { getActions, TOUR_BOOKING_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STEPS } from '../../config/statuses.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { formatParticipants } from '../../utils/tourismHelpers.js';
import { getConfirmDisabledReason } from '../../utils/paymentHelpers.js';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';

function TourBookingDetails({ initialBooking }) {
  const { item: booking, message, actionProps } = useAdminItem(initialBooking);
  const { tour } = booking;
  const actions = getActions(TOUR_BOOKING_ADMIN_ACTIONS, booking.status);

  return (
    <AdminDetailLayout
      subNav={<SectionNav {...TOURISM_SECTION_NAV} />}
      backTo="/admin/tourism"
      backLabel="Back to tour bookings"
      title={`Tour booking #${booking.id}`}
      status={booking.status}
      createdAt={booking.created_at}
      createdLabel="Booked on"
      message={message}
      steps={SERVICE_REQUEST_STEPS}
      progressLabel="Booking progress"
      cancelledMessage="This tour booking was cancelled."
      actions={
        actions.length > 0 && (
          <AdminStatusActions
            actions={actions}
            update={(action) => updateAdminTourBookingStatus(booking.id, action.status)}
            getDisabledReason={getConfirmDisabledReason(booking)}
            itemLabel={`tour booking #${booking.id}`}
            {...actionProps}
          />
        )
      }
      actionsEmptyText="No more actions for this booking."
      main={
        <DetailSection title={tour.name} subtitle={`${tour.location} · ${tour.duration}`}>
          <DetailFacts>
            <DetailFact label="Tour date">{formatDate(booking.tour_date)}</DetailFact>
            <DetailFact label="Participants">{formatParticipants(booking.participants)}</DetailFact>
            <DetailFact label="Note">
              <span className="whitespace-pre-line">{booking.note || '-'}</span>
            </DetailFact>
          </DetailFacts>
          <MoreLink to={`/tours/${tour.id}`} className="mt-2">
            View public tour page
          </MoreLink>
        </DetailSection>
      }
      side={
        <>
          <AdminGuestSection user={booking.user} />
          <DetailPriceSection
            rows={[
              { label: 'Price per person', value: formatCurrency(booking.unit_price) },
              { label: 'Participants', value: formatParticipants(booking.participants) },
            ]}
            total={booking.total_price}
          />
          <PaymentInfoCard order={booking} />
        </>
      }
    />
  );
}

// /admin/tourism/tours/:id
export default function AdminTourBookingDetailPage() {
  return (
    <DetailLoader
      load={getAdminTourBooking}
      notFound={{
        title: 'Tour booking not found',
        message: 'This tour booking does not exist.',
        to: '/admin/tourism',
        linkLabel: 'Back to tour bookings',
      }}
    >
      {(data) => <TourBookingDetails key={data.id} initialBooking={data} />}
    </DetailLoader>
  );
}
