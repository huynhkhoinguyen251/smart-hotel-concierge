import { getAdminBooking } from '../../api/adminBookings.api.js';
import AdminBookingActions from '../../components/admin/AdminBookingActions.jsx';
import AdminDetailLayout, {
  AdminFact,
  AdminFacts,
  AdminGuestSection,
  AdminPriceSection,
  AdminSection,
} from '../../components/admin/AdminDetailLayout.jsx';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';
import RoomImage from '../../components/rooms/RoomImage.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import MoreLink from '../../components/ui/MoreLink.jsx';
import { ADMIN_BOOKING_ACTIONS, BOOKING_STEPS } from '../../config/adminBookings.js';
import { getActions } from '../../config/adminRequests.js';
import { getDiscountLabel } from '../../config/vouchers.js';
import useAdminItem from '../../hooks/useAdminItem.js';
import { formatNights } from '../../utils/bookingHelpers.js';
import { CHECK_IN_TIME } from '../../utils/cancellation.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';

// Nội dung đơn. Giữ trong state để cập nhật ngay sau khi đổi trạng thái (API trả lại cả đơn).
function BookingDetails({ initialBooking }) {
  const { item: booking, message, actionProps } = useAdminItem(initialBooking);
  const { user, room } = booking;
  const hasActions = getActions(ADMIN_BOOKING_ACTIONS, booking.status).length > 0;
  const discount = Number(booking.discount_amount) || 0;

  return (
    <AdminDetailLayout
      backTo="/admin/bookings"
      backLabel="Back to bookings"
      title={`Booking #${booking.id}`}
      status={booking.status}
      createdAt={booking.created_at}
      message={message}
      steps={BOOKING_STEPS}
      progressLabel="Booking progress"
      cancelledMessage="This booking was cancelled."
      actions={hasActions && <AdminBookingActions booking={booking} {...actionProps} />}
      actionsEmptyText={`No more actions. This booking is ${booking.status === 'cancelled' ? 'cancelled' : 'checked out'}.`}
      main={
        <>
          <AdminSection title={`Room ${room.room_number}`} subtitle={room.room_type.name}>
            <RoomImage
              src={room.primary_image}
              alt={`${room.room_type.name}, room ${room.room_number}`}
              className="aspect-[16/9] w-full max-w-md rounded-panel"
            />
            <MoreLink to={`/rooms/${room.id}`} className="mt-3">
              View public room page
            </MoreLink>
          </AdminSection>

          <AdminSection title="Stay">
            <AdminFacts>
              <AdminFact label="Check-in">
                {formatDate(booking.check_in)}, from {CHECK_IN_TIME}
              </AdminFact>
              <AdminFact label="Check-out">{formatDate(booking.check_out)}</AdminFact>
              <AdminFact label="Nights">{booking.nights}</AdminFact>
              <AdminFact label="Guests">{booking.guests}</AdminFact>
            </AdminFacts>
          </AdminSection>
        </>
      }
      side={
        <>
          <AdminGuestSection user={user} />
          <AdminPriceSection
            rows={[
              { label: 'Price per night', value: formatCurrency(booking.price_per_night) },
              { label: 'Nights', value: formatNights(booking.nights) },
              ...(discount > 0
                ? [{ label: getDiscountLabel(booking.voucher?.code), value: `- ${formatCurrency(discount)}` }]
                : []),
            ]}
            total={booking.total_price}
          />
          <PaymentInfoCard order={booking} />
        </>
      }
    />
  );
}

// /admin/bookings/:id (chỉ admin).
export default function AdminBookingDetailPage() {
  return (
    <DetailLoader
      load={getAdminBooking}
      notFound={{
        title: 'Booking not found',
        message: 'This booking does not exist.',
        to: '/admin/bookings',
        linkLabel: 'Back to bookings',
      }}
    >
      {(booking) => <BookingDetails key={booking.id} initialBooking={booking} />}
    </DetailLoader>
  );
}
