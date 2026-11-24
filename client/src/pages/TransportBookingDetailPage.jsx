import { useState } from 'react';
import { cancelTransportBooking, getTransportBooking } from '../api/transportBookings.api.js';
import { DetailFact, DetailFacts, DetailSection } from '../components/detail/DetailParts.jsx';
import OrderDetailLayout from '../components/orders/OrderDetailLayout.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import MoreLink from '../components/ui/MoreLink.jsx';
import { SERVICE_REQUEST_STEPS } from '../config/statuses.js';
import { PLATE_PENDING_NOTE, TRANSPORT_BOOKING_CANCELLED_MESSAGE } from '../config/tourism.js';
import useCancelAction from '../hooks/useCancelAction.js';
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

  // Ví dụ 400: khách sạn vừa duyệt yêu cầu, không còn pending.
  const { success, error, showMessage, dialogProps, openDialog } = useCancelAction({
    cancel: () => cancelTransportBooking(booking.id),
    onCancelled: setBooking,
    successMessage: TRANSPORT_BOOKING_CANCELLED_MESSAGE,
    initialMessage,
  });

  // Tải lại đơn sau khi thanh toán hoặc hết hạn (thanh toán có thể đổi cả trạng thái đơn).
  const reloadAfterPayment = async (message) => {
    try {
      setBooking(await getTransportBooking(booking.id));
    } catch {
      // Lỗi mạng: giữ dữ liệu đang có; khách có thể tải lại trang.
    }
    if (message) showMessage('success', message);
  };

  return (
    <>
      <OrderDetailLayout
        order={booking}
        title={`Transport request #${booking.id}`}
        backTo="/my-trips?type=transport"
        backLabel="Back to my trips"
        createdLabel="Requested on"
        success={success}
        error={error}
        paymentType="transport"
        onPaid={reloadAfterPayment}
        onExpired={() => reloadAfterPayment('')}
        steps={SERVICE_REQUEST_STEPS}
        progressLabel="Request progress"
        cancelledMessage="This transport request was cancelled."
        main={
          <>
            <DetailSection title={service.name} subtitle={getTransportLabel(service.category)}>
              <DetailFacts>
                {isAirport && <DetailFact label="Flight number">{booking.flight_number || '-'}</DetailFact>}
                <DetailFact label={fields.start}>{formatDate(booking.start_at, { withTime: true })}</DetailFact>
                {isMotorbike && (
                  <>
                    <DetailFact label={fields.end}>{formatDate(booking.end_at, { withTime: true }) || '-'}</DetailFact>
                    <DetailFact label="Rental days">{rentalDays ? formatDays(rentalDays) : '-'}</DetailFact>
                  </>
                )}
                {quantityText && <DetailFact label={category.quantity.label}>{quantityText}</DetailFact>}
                <DetailFact label={fields.pickup}>{booking.pickup_location}</DetailFact>
                <DetailFact label={fields.dropoff}>{booking.dropoff_location}</DetailFact>
                <DetailFact label="Licence plate">{getPlateText(booking)}</DetailFact>
                <DetailFact label="Note">
                  <span className="whitespace-pre-line">{booking.note || '-'}</span>
                </DetailFact>
              </DetailFacts>
              <MoreLink to={`/transport/${service.id}`} className="mt-3">
                View service
              </MoreLink>
            </DetailSection>
            <ReviewPanel type="transport" itemId={booking.id} status={booking.status} />
          </>
        }
        price={{
          rows: [
            { label: 'Unit price', value: `${formatCurrency(booking.unit_price)} ${category?.priceUnit ?? ''}` },
            ...(multiplier ? [{ label: isMotorbike ? 'Rental days' : 'Quantity', value: multiplier }] : []),
          ],
          total: booking.total_price,
        }}
        cancellation={
          booking.can_cancel && {
            label: 'Cancel request',
            onCancel: openDialog,
            children: <p>You can cancel this request until the hotel approves it.</p>,
          }
        }
      />

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this transport request?"
        message={`${service.name} on ${formatDate(booking.start_at, { withTime: true })} will be cancelled.`}
        confirmLabel="Yes, cancel request"
        cancelLabel="Keep request"
        variant="danger"
      />
    </>
  );
}

// /my-trips/transport/:id (chỉ cho người đã đăng nhập).
export default function TransportBookingDetailPage() {
  // Thông báo từ trang đặt vận chuyển, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  // 403 (đơn của người khác) hiện giống 404, không lộ đơn có tồn tại hay không.
  return (
    <DetailLoader
      load={getTransportBooking}
      notFoundStatuses={[400, 403, 404]}
      notFound={{
        title: 'Transport request not found',
        message: 'This transport request does not exist or does not belong to you.',
        to: '/my-trips?type=transport',
        linkLabel: 'Back to my trips',
      }}
      errorClassName="shell py-10"
    >
      {(data) => (
        <TransportBookingDetails
          key={data.id}
          initialBooking={data}
          initialMessage={flashMessage}
        />
      )}
    </DetailLoader>
  );
}
