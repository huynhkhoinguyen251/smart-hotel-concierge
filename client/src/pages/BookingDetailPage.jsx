import { useState } from 'react';
import { cancelBooking, getBooking } from '../api/bookings.api.js';
import EditBookingForm from '../components/bookings/EditBookingForm.jsx';
import { DetailFact, DetailFacts, DetailSection } from '../components/detail/DetailParts.jsx';
import OrderDetailLayout from '../components/orders/OrderDetailLayout.jsx';
import ReviewPanel from '../components/reviews/ReviewPanel.jsx';
import Button from '../components/ui/Button.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DetailLoader from '../components/ui/DetailLoader.jsx';
import MoreLink from '../components/ui/MoreLink.jsx';
import PhotoFrame from '../components/ui/PhotoFrame.jsx';
import { FOOD_ORDER_BOOKING_STATUS } from '../config/food.js';
import { SERVICE_ELIGIBLE_BOOKING_STATUSES } from '../config/services.js';
import { BOOKING_STEPS, CANCELLABLE_BOOKING_STATUSES, EDITABLE_BOOKING_STATUS } from '../config/statuses.js';
import useCancelAction from '../hooks/useCancelAction.js';
import useFlashMessage from '../hooks/useFlashMessage.js';
import { formatNights } from '../utils/bookingHelpers.js';
import { CHECK_IN_TIME, getFreeCancellationDeadline } from '../utils/cancellation.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { isAwaitingPayment } from '../utils/paymentHelpers.js';
import { getDiscountLabel } from '../config/vouchers.js';

const SERVICES_NOTE =
  'Your pending or confirmed service requests for this stay will also be cancelled.';
const LATE_CANCEL_NOTE =
  'The free cancellation deadline has passed, so online cancellation may be refused. If it is, please contact the reception desk.';

// Nội dung đơn. Giữ đơn trong state để cập nhật ngay sau khi đổi ngày hoặc hủy.
function BookingDetails({ initialBooking, initialMessage }) {
  const [booking, setBooking] = useState(initialBooking);
  const [editing, setEditing] = useState(false);

  const { room } = booking;
  const canEdit = booking.status === EDITABLE_BOOKING_STATUS;
  const canTryCancel = CANCELLABLE_BOOKING_STATUSES.includes(booking.status);
  const canRequestService = SERVICE_ELIGIBLE_BOOKING_STATUSES.includes(booking.status);
  // Đồ ăn chỉ giao khi đang ở (checked_in); trạng thái này cũng nằm trong canRequestService.
  const canOrderFood = booking.status === FOOD_ORDER_BOOKING_STATUS;
  const deadline = canTryCancel ? getFreeCancellationDeadline(booking.check_in) : null;

  // Lỗi khi hủy, ví dụ 400: quá hạn hủy online, cần liên hệ lễ tân.
  const { success, error, showMessage, dialogProps, openDialog } = useCancelAction({
    cancel: () => cancelBooking(booking.id),
    onCancelled: (updated) => {
      setBooking(updated);
      setEditing(false);
    },
    successMessage: 'Your booking has been cancelled.',
    initialMessage,
  });

  // Tải lại đơn sau khi thanh toán hoặc hết hạn (thanh toán có thể đổi cả trạng thái đơn).
  const reloadAfterPayment = async (message) => {
    try {
      setBooking(await getBooking(booking.id));
    } catch {
      // Lỗi mạng: giữ dữ liệu đang có; khách có thể tải lại trang.
    }
    if (message) showMessage('success', message);
  };

  const handleSaved = (updated) => {
    setBooking(updated);
    setEditing(false);
    showMessage('success', 'Your booking has been updated.');
  };

  const roomName = `${room.room_type.name}, room ${room.room_number}`;

  return (
    <>
      <OrderDetailLayout
        order={booking}
        title={`Booking #${booking.id}`}
        backTo="/my-bookings"
        backLabel="Back to my bookings"
        createdLabel="Booked on"
        success={success}
        error={error}
        paymentType="room"
        onPaid={reloadAfterPayment}
        onExpired={() => reloadAfterPayment('')}
        steps={BOOKING_STEPS}
        progressLabel="Booking progress"
        cancelledMessage="This booking was cancelled."
        main={
          <>
            <section className="grid gap-x-6 gap-y-4 sm:grid-cols-[15rem_minmax(0,1fr)]">
              <PhotoFrame src={room.primary_image} alt={roomName} className="aspect-[4/3]" />
              <div className="min-w-0">
                <h2 className="text-xl font-semibold wrap-anywhere text-ink">{room.room_type.name}</h2>
                <p className="mt-0.5 text-sm text-ink-soft">Room {room.room_number}</p>
                <MoreLink to={`/rooms/${room.id}`} className="mt-3">
                  View room
                </MoreLink>
              </div>
            </section>

            <DetailSection title="Stay details">
              <DetailFacts>
                <DetailFact label="Check-in">
                  {formatDate(booking.check_in)}, from {CHECK_IN_TIME}
                </DetailFact>
                <DetailFact label="Check-out">{formatDate(booking.check_out)}</DetailFact>
                <DetailFact label="Nights">{booking.nights}</DetailFact>
                <DetailFact label="Guests">{booking.guests}</DetailFact>
              </DetailFacts>

              {canEdit && !editing && (
                <Button variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
                  Change dates or guests
                </Button>
              )}
              {canEdit && editing && (
                <div className="mt-5 max-w-xl">
                  <h3 className="mb-3 font-semibold text-ink">Change dates or guests</h3>
                  <EditBookingForm
                    booking={booking}
                    // Đơn chờ thanh toán: nút vàng duy nhất của trang là "I have paid".
                    saveVariant={isAwaitingPayment(booking) ? 'secondary' : 'primary'}
                    onSaved={handleSaved}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              )}
            </DetailSection>

            <ReviewPanel type="room" itemId={booking.id} status={booking.status} />

            {canRequestService && (
              <DetailSection title="Hotel services">
                <p className="max-w-prose text-sm text-ink-soft">
                  {canOrderFood
                    ? 'Book breakfast, massage, laundry and more, or order food to your room.'
                    : 'Book breakfast, massage, laundry and more for this stay.'}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink to={`/services?booking_id=${booking.id}`}>Request a service</ButtonLink>
                  {canOrderFood && (
                    <ButtonLink to={`/food?booking_id=${booking.id}`} variant="secondary">
                      Order food
                    </ButtonLink>
                  )}
                </div>
              </DetailSection>
            )}
          </>
        }
        price={{
          rows: [
            { label: 'Price per night', value: formatCurrency(booking.price_per_night) },
            { label: 'Nights', value: formatNights(booking.nights) },
            ...(booking.discount_amount > 0
              ? [{ label: getDiscountLabel(booking.voucher?.code), value: `- ${formatCurrency(booking.discount_amount)}` }]
              : []),
          ],
          total: booking.total_price,
        }}
        cancellation={
          canTryCancel && {
            label: 'Cancel booking',
            onCancel: openDialog,
            children: deadline && (
              <p className={deadline.passed ? 'text-warning-deep' : undefined}>
                {deadline.passed ? (
                  <>
                    The free cancellation deadline was {deadline.label}. Online cancellation may be refused; please
                    contact the reception desk if it is.
                  </>
                ) : (
                  <>
                    Free cancellation until <span className="font-semibold text-ink">{deadline.label}</span>.
                  </>
                )}
              </p>
            ),
          }
        }
      />

      <ConfirmDialog
        {...dialogProps}
        title="Cancel this booking?"
        message={SERVICES_NOTE}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        variant="danger"
      >
        {deadline?.passed && <p className="text-warning-deep">{LATE_CANCEL_NOTE}</p>}
      </ConfirmDialog>
    </>
  );
}

// /my-bookings/:id (chỉ cho người đã đăng nhập).
export default function BookingDetailPage() {
  // Thông báo từ trang đặt phòng, chỉ hiện một lần.
  const flashMessage = useFlashMessage();
  // 403 (đơn của người khác) hiện giống 404, không lộ đơn có tồn tại hay không.
  return (
    <DetailLoader
      load={getBooking}
      notFoundStatuses={[400, 403, 404]}
      notFound={{
        title: 'Booking not found',
        message: 'This booking does not exist or does not belong to you.',
        to: '/my-bookings',
        linkLabel: 'Back to my bookings',
      }}
      errorClassName="shell py-10"
    >
      {(data) => <BookingDetails key={data.id} initialBooking={data} initialMessage={flashMessage} />}
    </DetailLoader>
  );
}
