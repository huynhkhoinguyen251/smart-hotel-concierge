import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelTourBooking, getTourBooking } from '../api/tourBookings.api.js';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailRow from '../components/ui/DetailRow.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import StatusProgress from '../components/ui/StatusProgress.jsx';
import { SERVICE_REQUEST_STEPS } from '../config/statuses.js';
import { TOUR_BOOKING_CANCELLED_MESSAGE } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { formatParticipants } from '../utils/tourismHelpers.js';

// Nội dung đơn. Giữ trong state để cập nhật ngay sau khi hủy (API hủy trả lại cả đơn).
function TourBookingDetails({ initialBooking, initialMessage }) {
  const [booking, setBooking] = useState(initialBooking);
  const [success, setSuccess] = useState(initialMessage);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { tour } = booking;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      setBooking(await cancelTourBooking(booking.id));
      setSuccess(TOUR_BOOKING_CANCELLED_MESSAGE);
      setError('');
    } catch (apiError) {
      // Ví dụ 400: khách sạn vừa xác nhận đơn, không còn pending.
      setSuccess('');
      setError(apiError.message);
    } finally {
      setCancelling(false);
      setDialogOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/my-trips" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to my trips
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tour booking #{booking.id}
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

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Booking status</h2>
        <StatusProgress
          status={booking.status}
          steps={SERVICE_REQUEST_STEPS}
          label="Booking progress"
          cancelledMessage="This tour booking was cancelled."
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {tour.location} · {tour.duration}
          </p>
          <h2 className="mt-1 text-xl font-semibold break-words text-slate-900">{tour.name}</h2>
          <Link
            to={`/tours/${tour.id}`}
            className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View tour →
          </Link>

          <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            <DetailRow label="Tour date">{formatDate(booking.tour_date)}</DetailRow>
            <DetailRow label="Participants">{formatParticipants(booking.participants)}</DetailRow>
            <DetailRow label="Note">
              <span className="whitespace-pre-line">{booking.note || '-'}</span>
            </DetailRow>
            <DetailRow label="Booked on">{formatDate(booking.created_at, { withTime: true })}</DetailRow>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Price per person">{formatCurrency(booking.unit_price)}</DetailRow>
              <DetailRow label="Participants">{formatParticipants(booking.participants)}</DetailRow>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">
                  {formatCurrency(booking.total_price)}
                </dd>
              </div>
            </dl>
          </Card>

          {booking.can_cancel && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cancellation</h2>
              <p className="mt-2 text-sm text-slate-600">
                You can cancel this booking until the hotel confirms it.
              </p>
              <Button variant="danger" fullWidth className="mt-4" onClick={() => setDialogOpen(true)}>
                Cancel booking
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title="Cancel this tour booking?"
        message={`${tour.name} on ${formatDate(booking.tour_date)} will be cancelled.`}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

// /my-trips/tours/:id (chỉ cho người đã đăng nhập).
export default function TourBookingDetailPage() {
  const { id } = useParams();
  // Thông báo từ trang đặt tour, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  const request = useFetch(() => getTourBooking(id), [id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    // 403 (đơn của người khác) hiện giống 404, không lộ đơn có tồn tại hay không.
    if ([400, 403, 404].includes(request.error.status)) {
      return (
        <NotFoundView
          title="Tour booking not found"
          message="This tour booking does not exist or does not belong to you."
          to="/my-trips"
          linkLabel="Back to my trips"
        />
      );
    }
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  return (
    <TourBookingDetails key={request.data.id} initialBooking={request.data} initialMessage={flashMessage} />
  );
}
