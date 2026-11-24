import { useState } from 'react';
import { cancelTourBooking, getTourBooking } from '../api/tourBookings.api.js';
import { DetailFact, DetailFacts, DetailSection } from '../components/detail/DetailParts.jsx';
import OrderDetailLayout from '../components/orders/OrderDetailLayout.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import MoreLink from '../components/ui/MoreLink.jsx';
import { SERVICE_REQUEST_STEPS } from '../config/statuses.js';
import { TOUR_BOOKING_CANCELLED_MESSAGE } from '../config/tourism.js';
import useCancelAction from '../hooks/useCancelAction.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { formatParticipants } from '../utils/tourismHelpers.js';

// Nội dung đơn. Giữ trong state để cập nhật ngay sau khi hủy (API hủy trả lại cả đơn).
function TourBookingDetails({ initialBooking, initialMessage }) {
  const [booking, setBooking] = useState(initialBooking);

  const { tour } = booking;

  // Ví dụ 400: khách sạn vừa xác nhận đơn, không còn pending.
  const { success, error, showMessage, dialogProps, openDialog } = useCancelAction({
    cancel: () => cancelTourBooking(booking.id),
    onCancelled: setBooking,
    successMessage: TOUR_BOOKING_CANCELLED_MESSAGE,
    initialMessage,
  });

  // Tải lại đơn sau khi thanh toán hoặc hết hạn (thanh toán có thể đổi cả trạng thái đơn).
  const reloadAfterPayment = async (message) => {
    try {
      setBooking(await getTourBooking(booking.id));
    } catch {
      // Lỗi mạng: giữ dữ liệu đang có; khách có thể tải lại trang.
    }
    if (message) showMessage('success', message);
  };

  return (
    <>
      <OrderDetailLayout
        order={booking}
        title={`Tour booking #${booking.id}`}
        backTo="/my-trips"
        backLabel="Back to my trips"
        createdLabel="Booked on"
        success={success}
        error={error}
        paymentType="tour"
        onPaid={reloadAfterPayment}
        onExpired={() => reloadAfterPayment('')}
        steps={SERVICE_REQUEST_STEPS}
        progressLabel="Booking progress"
        cancelledMessage="This tour booking was cancelled."
        main={
          <>
            <DetailSection title={tour.name} subtitle={`${tour.location} · ${tour.duration}`}>
              <DetailFacts>
                <DetailFact label="Tour date">{formatDate(booking.tour_date)}</DetailFact>
                <DetailFact label="Participants">{formatParticipants(booking.participants)}</DetailFact>
                <DetailFact label="Note">
                  <span className="whitespace-pre-line">{booking.note || '-'}</span>
                </DetailFact>
              </DetailFacts>
              <MoreLink to={`/tours/${tour.id}`} className="mt-3">
                View tour
              </MoreLink>
            </DetailSection>
            <ReviewPanel type="tour" itemId={booking.id} status={booking.status} />
          </>
        }
        price={{
          rows: [
            { label: 'Price per person', value: formatCurrency(booking.unit_price) },
            { label: 'Participants', value: formatParticipants(booking.participants) },
          ],
          total: booking.total_price,
        }}
        cancellation={
          booking.can_cancel && {
            label: 'Cancel booking',
            onCancel: openDialog,
            children: <p>You can cancel this booking until the hotel confirms it.</p>,
          }
        }
      />

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this tour booking?"
        message={`${tour.name} on ${formatDate(booking.tour_date)} will be cancelled.`}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        variant="danger"
      />
    </>
  );
}

// /my-trips/tours/:id (chỉ cho người đã đăng nhập).
export default function TourBookingDetailPage() {
  // Thông báo từ trang đặt tour, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  // 403 (đơn của người khác) hiện giống 404, không lộ đơn có tồn tại hay không.
  return (
    <DetailLoader
      load={getTourBooking}
      notFoundStatuses={[400, 403, 404]}
      notFound={{
        title: 'Tour booking not found',
        message: 'This tour booking does not exist or does not belong to you.',
        to: '/my-trips',
        linkLabel: 'Back to my trips',
      }}
      errorClassName="shell py-10"
    >
      {(data) => (
        <TourBookingDetails key={data.id} initialBooking={data} initialMessage={flashMessage} />
      )}
    </DetailLoader>
  );
}
