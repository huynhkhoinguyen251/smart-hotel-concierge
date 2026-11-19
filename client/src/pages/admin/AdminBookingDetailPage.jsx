import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminBooking } from '../../api/adminBookings.api.js';
import AdminBookingActions from '../../components/admin/AdminBookingActions.jsx';
import RoomImage from '../../components/rooms/RoomImage.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailLoader from '../../components/ui/DetailLoader.jsx';
import DetailRow from '../../components/ui/DetailRow.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import StatusProgress from '../../components/ui/StatusProgress.jsx';
import { ADMIN_BOOKING_ACTIONS, BOOKING_STEPS } from '../../config/adminBookings.js';
import { getActions } from '../../config/adminRequests.js';
import { CHECK_IN_TIME } from '../../utils/cancellation.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import PaymentInfoCard from '../../components/payments/PaymentInfoCard.jsx';

// Nội dung đơn. Giữ trong state để cập nhật ngay sau khi đổi trạng thái (API trả lại cả đơn).
function BookingDetails({ initialBooking }) {
  const [booking, setBooking] = useState(initialBooking);
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const { user, room } = booking;
  const hasActions = getActions(ADMIN_BOOKING_ACTIONS, booking.status).length > 0;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/bookings" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to bookings
      </Link>

      <div className="mt-3 mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Booking #{booking.id}</h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mb-6 text-sm text-slate-500">Created on {formatDate(booking.created_at, { withTime: true })}</p>

      <div className="mb-6 empty:hidden" aria-live="polite">
        <Alert type={message.type}>{message.text}</Alert>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Booking status</h2>
        <StatusProgress
          status={booking.status}
          steps={BOOKING_STEPS}
          label="Booking progress"
          cancelledMessage="This booking was cancelled."
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card className="flex flex-col gap-4 sm:flex-row">
            <RoomImage
              src={room.primary_image}
              alt={`${room.room_type.name}, room ${room.room_number}`}
              className="aspect-[4/3] w-full rounded-xl sm:w-44 sm:shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Room</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Room {room.room_number}</h2>
              <p className="text-sm text-slate-500">{room.room_type.name}</p>
              <Link
                to={`/rooms/${room.id}`}
                className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                View public room page →
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Stay</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Check-in">
                {formatDate(booking.check_in)}, from {CHECK_IN_TIME}
              </DetailRow>
              <DetailRow label="Check-out">{formatDate(booking.check_out)}</DetailRow>
              <DetailRow label="Nights">{booking.nights}</DetailRow>
              <DetailRow label="Guests">{booking.guests}</DetailRow>
              <DetailRow label="Price per night">{formatCurrency(booking.price_per_night)}</DetailRow>
              {Number(booking.discount_amount) > 0 && (
                <DetailRow label="Discount">- {formatCurrency(booking.discount_amount)}</DetailRow>
              )}
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">{formatCurrency(booking.total_price)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Guest</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Name">{user?.full_name ?? '-'}</DetailRow>
              <DetailRow label="Email">
                {user?.email ? (
                  <a href={`mailto:${user.email}`} className="break-all text-teal-700 hover:text-teal-800">
                    {user.email}
                  </a>
                ) : (
                  '-'
                )}
              </DetailRow>
              {/* API đơn đặt phòng hiện chỉ trả họ tên và email; số điện thoại hiện khi có. */}
              {user?.phone && <DetailRow label="Phone">{user.phone}</DetailRow>}
            </dl>
          </Card>

          <PaymentInfoCard order={booking} />

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Actions</h2>
            {hasActions ? (
              <AdminBookingActions
                booking={booking}
                showNotes
                onSuccess={(updated, text) => {
                  setBooking(updated);
                  showMessage('success', text);
                }}
                onError={(text) => showMessage('error', text)}
              />
            ) : (
              <p className="text-sm text-slate-500">
                No more actions. This booking is {booking.status === 'cancelled' ? 'cancelled' : 'checked out'}.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
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
