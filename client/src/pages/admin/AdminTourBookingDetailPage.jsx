import { Link } from 'react-router-dom';
import { getAdminTourBooking, updateAdminTourBookingStatus } from '../../api/adminTourism.api.js';
import AdminDetailLayout, { AdminActionsCard, AdminGuestCard } from '../../components/admin/AdminDetailLayout.jsx';
import TourismTabs from '../../components/admin/TourismTabs.jsx';
import AdminDetailLoader from '../../components/admin/AdminDetailLoader.jsx';
import AdminStatusActions from '../../components/admin/AdminStatusActions.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import { getActions, TOUR_BOOKING_ADMIN_ACTIONS } from '../../config/adminRequests.js';
import { SERVICE_REQUEST_STEPS } from '../../config/statuses.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import { formatParticipants } from '../../utils/tourismHelpers.js';

function TourBookingDetails({ initialBooking }) {
  const { item: booking, message, actionProps } = useAdminItem(initialBooking);
  const { tour } = booking;
  const actions = getActions(TOUR_BOOKING_ADMIN_ACTIONS, booking.status);

  return (
    <AdminDetailLayout
      subNav={<TourismTabs />}
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
      main={
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {tour.location} · {tour.duration}
          </p>
          <h2 className="mt-1 text-xl font-semibold break-words text-slate-900">{tour.name}</h2>
          <Link
            to={`/tours/${tour.id}`}
            className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View public tour page →
          </Link>
          <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            <DetailRow label="Tour date">{formatDate(booking.tour_date)}</DetailRow>
            <DetailRow label="Participants">{formatParticipants(booking.participants)}</DetailRow>
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
              <DetailRow label="Price per person">{formatCurrency(booking.unit_price)}</DetailRow>
              <DetailRow label="Participants">{formatParticipants(booking.participants)}</DetailRow>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">{formatCurrency(booking.total_price)}</dd>
              </div>
            </dl>
          </Card>
          <AdminActionsCard emptyText="No more actions for this booking.">
            {actions.length > 0 && (
              <AdminStatusActions
                actions={actions}
                update={(action) => updateAdminTourBookingStatus(booking.id, action.status)}
                itemLabel={`tour booking #${booking.id}`}
                {...actionProps}
              />
            )}
          </AdminActionsCard>
        </>
      }
    />
  );
}

// /admin/tourism/tours/:id
export default function AdminTourBookingDetailPage() {
  return (
    <AdminDetailLoader
      load={getAdminTourBooking}
      notFound={{
        title: 'Tour booking not found',
        message: 'This tour booking does not exist.',
        to: '/admin/tourism',
        linkLabel: 'Back to tour bookings',
      }}
    >
      {(data) => <TourBookingDetails key={data.id} initialBooking={data} />}
    </AdminDetailLoader>
  );
}
