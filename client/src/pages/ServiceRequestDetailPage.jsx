import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelServiceBooking, getServiceBooking } from '../api/serviceBookings.api.js';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { CANCELLABLE_SERVICE_REQUEST_STATUS } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../utils/serviceHelpers.js';

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-slate-600">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

// Nội dung yêu cầu. Giữ trong state để cập nhật ngay sau khi hủy.
function RequestDetails({ initialRequest, initialMessage }) {
  const [request, setRequest] = useState(initialRequest);
  const [success, setSuccess] = useState(initialMessage);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { service, booking } = request;
  const canCancel = request.status === CANCELLABLE_SERVICE_REQUEST_STATUS;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const updated = await cancelServiceBooking(request.id);
      setRequest(updated);
      setSuccess('Your service request has been cancelled.');
      setError('');
    } catch (apiError) {
      // Ví dụ 400: khách sạn vừa xác nhận yêu cầu, không còn pending.
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
      <Link to="/my-services" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to my service requests
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Service request #{request.id}
        </h1>
        <StatusBadge status={request.status} />
      </div>
      <p className="-mt-4 mb-6 text-sm text-slate-500">
        Requested on {formatDate(request.created_at, { withTime: true })}
      </p>

      <div className="mb-6 space-y-3" aria-live="polite">
        <Alert type="success">{success}</Alert>
        <Alert type="error">{error}</Alert>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {getCategoryLabel(service.category)}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{service.name}</h2>
          <Link
            to={`/services/${service.id}`}
            className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View service →
          </Link>

          <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            <DetailRow label="Scheduled for">
              {formatDate(request.scheduled_at, { withTime: true })}
            </DetailRow>
            <DetailRow label="Quantity">{formatQuantity(request.quantity, service.category)}</DetailRow>
            <DetailRow label="Room booking">
              <Link
                to={`/my-bookings/${booking.id}`}
                className="text-teal-700 hover:text-teal-800"
              >
                Room {booking.room.room_number} · Booking #{booking.id}
              </Link>
            </DetailRow>
            <DetailRow label="Note">{request.note || '-'}</DetailRow>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Price</h2>
            <dl className="mt-2 divide-y divide-slate-100 text-sm">
              <DetailRow label="Unit price">{formatCurrency(request.unit_price)}</DetailRow>
              <DetailRow label="Quantity">{formatQuantity(request.quantity, service.category)}</DetailRow>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right text-lg font-bold text-teal-700">
                  {formatCurrency(request.total_price)}
                </dd>
              </div>
            </dl>
          </Card>

          {canCancel && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cancellation</h2>
              <p className="mt-2 text-sm text-slate-600">
                You can cancel this request until the hotel confirms it.
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
        title="Cancel this service request?"
        message={`${service.name} on ${formatDate(request.scheduled_at, { withTime: true })} will be cancelled.`}
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

// /my-services/:id (chỉ cho người đã đăng nhập).
export default function ServiceRequestDetailPage() {
  const { id } = useParams();
  // Thông báo từ trang đặt dịch vụ, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  const request = useFetch(() => getServiceBooking(id), [id]);

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    // 403 (yêu cầu của người khác) hiện giống 404, không lộ yêu cầu có tồn tại hay không.
    if ([400, 403, 404].includes(request.error.status)) {
      return (
        <NotFoundView
          title="Service request not found"
          message="This service request does not exist or does not belong to you."
          to="/my-services"
          linkLabel="Back to my service requests"
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
    <RequestDetails key={request.data.id} initialRequest={request.data} initialMessage={flashMessage} />
  );
}
