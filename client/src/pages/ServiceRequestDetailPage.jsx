import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelServiceBooking, getServiceBooking } from '../api/serviceBookings.api.js';
import { DetailFact, DetailFacts, DetailSection } from '../components/detail/DetailParts.jsx';
import OrderDetailLayout from '../components/orders/OrderDetailLayout.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import MoreLink from '../components/ui/MoreLink.jsx';
import { CANCELLABLE_SERVICE_REQUEST_STATUS, SERVICE_REQUEST_STEPS } from '../config/statuses.js';
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
    <>
      <OrderDetailLayout
        order={request}
        title={`Service request #${request.id}`}
        backTo="/my-services"
        backLabel="Back to my service requests"
        createdLabel="Requested on"
        success={success}
        error={error}
        paymentType="service"
        onPaid={reloadAfterPayment}
        onExpired={() => reloadAfterPayment('')}
        steps={SERVICE_REQUEST_STEPS}
        progressLabel="Request progress"
        cancelledMessage="This service request was cancelled."
        main={
          <>
            <DetailSection title={service.name} subtitle={getCategoryLabel(service.category)}>
              <DetailFacts>
                <DetailFact label="Scheduled for">{formatDate(request.scheduled_at, { withTime: true })}</DetailFact>
                <DetailFact label="Quantity">{formatQuantity(request.quantity, service.category)}</DetailFact>
                <DetailFact label="Room booking">
                  <Link to={`/my-bookings/${booking.id}`} className="text-sea hover:text-sea-hover hover:underline">
                    Room {booking.room.room_number} · Booking #{booking.id}
                  </Link>
                </DetailFact>
                <DetailFact label="Note">
                  <span className="whitespace-pre-line">{request.note || '-'}</span>
                </DetailFact>
              </DetailFacts>
              <MoreLink to={`/services/${service.id}`} className="mt-3">
                View service
              </MoreLink>
            </DetailSection>
            <ReviewPanel type="service" itemId={request.id} status={request.status} />
          </>
        }
        price={{
          rows: [
            { label: 'Unit price', value: formatCurrency(request.unit_price) },
            { label: 'Quantity', value: formatQuantity(request.quantity, service.category) },
          ],
          total: request.total_price,
        }}
        cancellation={
          canCancel && {
            label: 'Cancel request',
            onCancel: openDialog,
            children: <p>You can cancel this request until the hotel confirms it.</p>,
          }
        }
      />

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this service request?"
        message={`${service.name} on ${formatDate(request.scheduled_at, { withTime: true })} will be cancelled.`}
        confirmLabel="Yes, cancel request"
        cancelLabel="Keep request"
        variant="danger"
      />
    </>
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
      errorClassName="shell py-10"
    >
      {(data) => (
        <RequestDetails key={data.id} initialRequest={data} initialMessage={flashMessage} />
      )}
    </DetailLoader>
  );
}
