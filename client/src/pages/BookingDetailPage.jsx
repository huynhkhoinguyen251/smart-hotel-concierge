import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { cancelBooking, getBooking } from '../api/bookings.api.js';
import EditBookingForm from '../components/bookings/EditBookingForm.jsx';
import RoomImage from '../components/rooms/RoomImage.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { CANCELLABLE_BOOKING_STATUSES, EDITABLE_BOOKING_STATUS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import { CHECK_IN_TIME, getFreeCancellationDeadline } from '../utils/cancellation.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';

const SERVICES_NOTE =
  'Your pending or confirmed service requests for this stay will also be cancelled.';
const LATE_CANCEL_NOTE =
  'The free cancellation deadline has passed, so online cancellation may be refused. If it is, please contact the reception desk.';

// 404 (không có) hoặc 403 (đơn của người khác): cùng một thông báo, không lộ đơn có tồn tại hay không.
function BookingNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl font-bold text-teal-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Booking not found</h1>
      <p className="mt-2 text-slate-600">This booking does not exist or does not belong to you.</p>
      <Link
        to="/my-bookings"
        className="mt-8 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Back to my bookings
      </Link>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-slate-600">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

// Nội dung đơn. Giữ đơn trong state để cập nhật ngay sau khi đổi ngày hoặc hủy.
function BookingDetails({ initialBooking, initialMessage }) {
  const [booking, setBooking] = useState(initialBooking);
  const [success, setSuccess] = useState(initialMessage);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { room } = booking;
  const canEdit = booking.status === EDITABLE_BOOKING_STATUS;
  const canTryCancel = CANCELLABLE_BOOKING_STATUSES.includes(booking.status);
  const deadline = canTryCancel ? getFreeCancellationDeadline(booking.check_in) : null;
  const nightsLabel = `${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`;

  const showMessage = (type, text) => {
    setSuccess(type === 'success' ? text : '');
    setError(type === 'error' ? text : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaved = (updated) => {
    setBooking(updated);
    setEditing(false);
    showMessage('success', 'Your booking has been updated.');
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
      setEditing(false);
      showMessage('success', 'Your booking has been cancelled.');
    } catch (apiError) {
      // Ví dụ 400: quá hạn hủy online, cần liên hệ lễ tân.
      showMessage('error', apiError.message);
    } finally {
      setCancelling(false);
      setDialogOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/my-bookings" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to my bookings
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Booking #{booking.id}
        </h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="-mt-4 mb-6 text-sm text-slate-500">
        Booked on {formatDate(booking.created_at, { withTime: true })}
      </p>

      <div className="mb-6 space-y-3" aria-live="polite">
        <Alert type="success">{success}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card className="flex flex-col gap-4 sm:flex-row">
            <RoomImage
              src={room.primary_image}
              alt={`${room.room_type.name}, room ${room.room_number}`}
              className="aspect-[4/3] w-full rounded-xl sm:w-48 sm:shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900">{room.room_type.name}</h2>
              <p className="mt-0.5 text-sm text-slate-500">Room {room.room_number}</p>
              <Link
                to={`/rooms/${room.id}`}
                className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                View room →
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Stay details</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Check-in">
                {formatDate(booking.check_in)}, from {CHECK_IN_TIME}
              </DetailRow>
              <DetailRow label="Check-out">{formatDate(booking.check_out)}</DetailRow>
              <DetailRow label="Nights">{booking.nights}</DetailRow>
              <DetailRow label="Guests">{booking.guests}</DetailRow>
            </dl>

            {canEdit && !editing && (
              <Button variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
                Change dates or guests
              </Button>
            )}
            {canEdit && editing && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="mb-3 font-semibold text-slate-900">Change dates or guests</h3>
                <EditBookingForm
                  booking={booking}
                  onSaved={handleSaved}
                  onCancel={() => setEditing(false)}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Price per night">{formatCurrency(booking.price_per_night)}</DetailRow>
              <DetailRow label="Nights">{nightsLabel}</DetailRow>
              {booking.discount_amount > 0 && (
                <DetailRow label="Discount">- {formatCurrency(booking.discount_amount)}</DetailRow>
              )}
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">
                  {formatCurrency(booking.total_price)}
                </dd>
              </div>
            </dl>
          </Card>

          {canTryCancel && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cancellation</h2>
              {deadline && !deadline.passed && (
                <p className="mt-2 text-sm text-slate-600">
                  Free cancellation until <span className="font-semibold">{deadline.label}</span>.
                </p>
              )}
              {deadline?.passed && (
                <p className="mt-2 text-sm text-amber-700">
                  The free cancellation deadline was {deadline.label}. Online cancellation may be
                  refused; please contact the reception desk if it is.
                </p>
              )}
              <Button variant="danger" fullWidth className="mt-4" onClick={() => setDialogOpen(true)}>
                Cancel booking
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title="Cancel this booking?"
        message={SERVICES_NOTE}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setDialogOpen(false)}
      >
        {deadline?.passed && <p className="text-amber-700">{LATE_CANCEL_NOTE}</p>}
      </ConfirmDialog>
    </div>
  );
}

// /my-bookings/:id (chỉ cho người đã đăng nhập).
export default function BookingDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Thông báo từ trang đặt phòng chỉ hiện một lần: đọc ra rồi xóa khỏi lịch sử,
  // nên tải lại trang hoặc bấm Back/Forward sẽ không hiện lại.
  const [flashMessage] = useState(() => location.state?.success ?? '');

  useEffect(() => {
    if (location.state?.success) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location, navigate]);

  const request = useFetch(() => getBooking(id), [id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    if ([400, 403, 404].includes(request.error.status)) return <BookingNotFound />;
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  return (
    <BookingDetails key={request.data.id} initialBooking={request.data} initialMessage={flashMessage} />
  );
}
