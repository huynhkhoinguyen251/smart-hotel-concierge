import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelServiceBooking, getServiceBooking } from '../api/serviceBookings.api.js';
import PaymentPanel from '../components/payments/PaymentPanel.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import DetailRow from '../components/ui/DetailRow.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { CANCELLABLE_SERVICE_REQUEST_STATUS } from '../config/statuses.js';
import useCancelAction from '../hooks/useCancelAction.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../utils/serviceHelpers.js';

// Nội dung yêu cầu. Giữ trong state để cập nhật ngay sau khi hủy.
function RequestDetails({ initialRequest, initialMessage }) {
  const [request, setRequest] = useState(initialRequest);

  const { service, booking } = request;
  const canCancel = request.status === CANCELLABLE_SERVICE_REQUEST_STATUS;

  // Ví dụ 400: khách sạn vừa xác nhận yêu cầu, không còn pending.
  const { success, error, showMessage, dialogProps, openDialog } = useCancelAction({
    cancel: () => cancelServiceBooking(request.id),
    onCancelled: setRequest,
    successMessage: 'Your service request has been cancelled.',
    initialMessage,
  });

  // Tải lại đơn sau khi thanh toán hoặc hết hạn (thanh toán có thể đổi cả trạng thái đơn).
  const reloadAfterPayment = async (message) => {
    try {
      setRequest(await getServiceBooking(request.id));
    } catch {
      // Lỗi mạng: giữ dữ liệu đang có; khách có thể tải lại trang.
    }
    if (message) showMessage('success', message);
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

      <div className="mb-6 empty:hidden">
        <PaymentPanel
          type="service"
          order={request}
          onPaid={reloadAfterPayment}
          onExpired={() => reloadAfterPayment('')}
        />
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

          <ReviewPanel type={'service'} itemId={request.id} status={request.status} />

          {canCancel && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Cancellation</h2>
              <p className="mt-2 text-sm text-slate-600">
                You can cancel this request until the hotel confirms it.
              </p>
              <Button variant="danger" fullWidth className="mt-4" onClick={openDialog}>
                Cancel request
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this service request?"
        message={`${service.name} on ${formatDate(request.scheduled_at, { withTime: true })} will be cancelled.`}
        confirmLabel="Yes, cancel request"
        cancelLabel="Keep request"
        variant="danger"
      />
    </div>
  );
}

// /my-services/:id (chỉ cho người đã đăng nhập).
export default function ServiceRequestDetailPage() {
  // Thông báo từ trang đặt dịch vụ, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  // 403 (yêu cầu của người khác) hiện giống 404, không lộ yêu cầu có tồn tại hay không.
  return (
    <DetailLoader
      load={getServiceBooking}
      notFoundStatuses={[400, 403, 404]}
      notFound={{
        title: 'Service request not found',
        message: 'This service request does not exist or does not belong to you.',
        to: '/my-services',
        linkLabel: 'Back to my service requests',
      }}
      errorClassName="mx-auto max-w-5xl px-4 py-10"
    >
      {(data) => (
        <RequestDetails key={data.id} initialRequest={data} initialMessage={flashMessage} />
      )}
    </DetailLoader>
  );
}
