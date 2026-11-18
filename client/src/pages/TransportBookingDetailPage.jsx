import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelTransportBooking, getTransportBooking } from '../api/transportBookings.api.js';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
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
import { PLATE_PENDING_NOTE, TRANSPORT_BOOKING_CANCELLED_MESSAGE } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import {
  formatDays,
  formatTransportQuantity,
  getRentalDays,
  getTransportCategory,
  getTransportLabel,
} from '../utils/tourismHelpers.js';

// Biển số: có thì hiện; xe máy đang chờ duyệt thì báo sẽ có khi duyệt; còn lại "-".
const getPlateText = (booking) => {
  if (booking.vehicle_plate) return booking.vehicle_plate;
  if (booking.service.category === 'motorbike_rental' && booking.status === 'pending') {
    return PLATE_PENDING_NOTE;
  }
  return '-';
};

// Nội dung đơn. Giữ trong state để cập nhật ngay sau khi hủy (API hủy trả lại cả đơn).
function TransportBookingDetails({ initialBooking, initialMessage }) {
  const [booking, setBooking] = useState(initialBooking);
  const [success, setSuccess] = useState(initialMessage);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { service } = booking;
  const category = getTransportCategory(service.category);
  const isMotorbike = service.category === 'motorbike_rental';
  const isAirport = service.category === 'airport_pickup';
  const rentalDays = isMotorbike ? getRentalDays(booking.start_at, booking.end_at) : 0;
  const quantityText = formatTransportQuantity(booking.quantity, service.category);
  // Xe máy: giá × số ngày; hai loại còn lại: giá × số lượng.
  const multiplier = isMotorbike ? formatDays(rentalDays) : quantityText;
  // Không phải 3 loại vận chuyển (dữ liệu lạ) thì dùng nhãn chung.
  const fields = category?.fields ?? { start: 'Start time', end: 'End time', pickup: 'Pickup location', dropoff: 'Drop-off location' };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      setBooking(await cancelTransportBooking(booking.id));
      setSuccess(TRANSPORT_BOOKING_CANCELLED_MESSAGE);
      setError('');
    } catch (apiError) {
      // Ví dụ 400: khách sạn vừa duyệt yêu cầu, không còn pending.
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
      <Link to="/my-trips?type=transport" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to my trips
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Transport request #{booking.id}
        </h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="-mt-4 mb-6 text-sm text-slate-500">
        Requested on {formatDate(booking.created_at, { withTime: true })}
      </p>

      <div className="mb-6 space-y-3" aria-live="polite">
        <Alert type="success">{success}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Request status</h2>
        <StatusProgress
          status={booking.status}
          steps={SERVICE_REQUEST_STEPS}
          label="Request progress"
          cancelledMessage="This transport request was cancelled."
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {getTransportLabel(service.category)}
          </p>
          <h2 className="mt-1 text-xl font-semibold break-words text-slate-900">{service.name}</h2>
          <Link
            to={`/transport/${service.id}`}
            className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View service →
          </Link>

          <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            {isAirport && <DetailRow label="Flight number">{booking.flight_number || '-'}</DetailRow>}
            <DetailRow label={fields.start}>{formatDate(booking.start_at, { withTime: true })}</DetailRow>
            {isMotorbike && (
              <>
                <DetailRow label={fields.end}>{formatDate(booking.end_at, { withTime: true }) || '-'}</DetailRow>
                <DetailRow label="Rental days">{rentalDays ? formatDays(rentalDays) : '-'}</DetailRow>
              </>
            )}
            {quantityText && <DetailRow label={category.quantity.label}>{quantityText}</DetailRow>}
            <DetailRow label={fields.pickup}>{booking.pickup_location}</DetailRow>
            <DetailRow label={fields.dropoff}>{booking.dropoff_location}</DetailRow>
            <DetailRow label="Licence plate">{getPlateText(booking)}</DetailRow>
            <DetailRow label="Note">
              <span className="whitespace-pre-line">{booking.note || '-'}</span>
            </DetailRow>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Unit price">
                {formatCurrency(booking.unit_price)} {category?.priceUnit ?? ''}
              </DetailRow>
              {multiplier && <DetailRow label={isMotorbike ? 'Rental days' : 'Quantity'}>{multiplier}</DetailRow>}
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">
                  {formatCurrency(booking.total_price)}
                </dd>
              </div>
            </dl>
          </Card>

          <ReviewPanel type={'transport'} itemId={booking.id} status={booking.status} />

          {booking.can_cancel && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cancellation</h2>
              <p className="mt-2 text-sm text-slate-600">
                You can cancel this request until the hotel approves it.
              </p>
              <Button variant="danger" fullWidth className="mt-4" onClick={() => setDialogOpen(true)}>
                Cancel request
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title="Cancel this transport request?"
        message={`${service.name} on ${formatDate(booking.start_at, { withTime: true })} will be cancelled.`}
        confirmLabel="Yes, cancel request"
        cancelLabel="Keep request"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

// /my-trips/transport/:id (chỉ cho người đã đăng nhập).
export default function TransportBookingDetailPage() {
  const { id } = useParams();
  // Thông báo từ trang đặt vận chuyển, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  const request = useFetch(() => getTransportBooking(id), [id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    // 403 (đơn của người khác) hiện giống 404, không lộ đơn có tồn tại hay không.
    if ([400, 403, 404].includes(request.error.status)) {
      return (
        <NotFoundView
          title="Transport request not found"
          message="This transport request does not exist or does not belong to you."
          to="/my-trips?type=transport"
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
    <TransportBookingDetails
      key={request.data.id}
      initialBooking={request.data}
      initialMessage={flashMessage}
    />
  );
}
