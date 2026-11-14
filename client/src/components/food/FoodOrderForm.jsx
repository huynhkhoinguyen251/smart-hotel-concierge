import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings.api.js';
import { createFoodOrder } from '../../api/foodOrders.api.js';
import {
  FOOD_NOTE_MAX_LENGTH,
  FOOD_ORDER_BOOKING_STATUS,
  FOOD_ORDER_CREATED_MESSAGE,
  MAX_ORDER_LINES,
  NO_CHECKED_IN_BOOKING_NOTE,
} from '../../config/food.js';
import useFetch from '../../hooks/useFetch.js';
import { toOrderItems } from '../../utils/foodCart.js';
import { getBookingOptionLabel } from '../../utils/serviceHelpers.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Select from '../ui/Select.jsx';
import Spinner from '../ui/Spinner.jsx';
import Textarea from '../ui/Textarea.jsx';

// Khách thường chỉ có 1 đơn đang ở; 50 là giới hạn limit của backend.
const BOOKINGS_LIMIT = 50;

// Giỏ trống hoặc quá số món tối đa thì không đặt được.
const canOrderLines = (lines) => lines.length > 0 && lines.length <= MAX_ORDER_LINES;

// Chưa có đơn nào đã check-in: vẫn hiện nút đặt nhưng bị khóa.
function NoCheckedInBooking() {
  return (
    <div className="space-y-4">
      <Alert type="info">
        {NO_CHECKED_IN_BOOKING_NOTE}{' '}
        <Link to="/my-bookings" className="font-semibold underline hover:no-underline">
          My bookings
        </Link>
      </Alert>
      <Button fullWidth disabled>
        Place order
      </Button>
    </div>
  );
}

function OrderFields({ lines, bookings, initialBookingId, onOrdered }) {
  const navigate = useNavigate();
  const matched = bookings.find((booking) => String(booking.id) === initialBookingId);
  // Có ?booking_id= khớp thì chọn đơn đó; chỉ có một đơn thì chọn luôn; còn lại để khách tự chọn.
  const preselected = matched ?? (bookings.length === 1 ? bookings[0] : null);
  const [bookingId, setBookingId] = useState(preselected ? String(preselected.id) : '');
  const [note, setNote] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bookingNotUsable = Boolean(initialBookingId) && !matched;
  const options = [
    ...(preselected ? [] : [{ value: '', label: 'Choose your room' }]),
    ...bookings.map((booking) => ({ value: String(booking.id), label: getBookingOptionLabel(booking) })),
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!bookingId) {
      setBookingError('Choose the room to deliver to');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      const created = await createFoodOrder({
        booking_id: Number(bookingId),
        items: toOrderItems(lines),
        note: note.trim(),
      });
      onOrdered();
      navigate(`/my-food-orders/${created.id}`, { state: { success: FOOD_ORDER_CREATED_MESSAGE } });
    } catch (apiError) {
      // Ví dụ 400: đơn vừa check-out hoặc một món vừa ngừng bán; 404: món không còn.
      setSubmitError(apiError.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Place your order">
      {bookingNotUsable && (
        <Alert type="info">
          Booking #{initialBookingId} is not checked in, so food cannot be delivered to it.
        </Alert>
      )}
      <Select
        label="Deliver to"
        name="booking_id"
        value={bookingId}
        onChange={(event) => {
          setBookingId(event.target.value);
          setBookingError('');
          setSubmitError('');
        }}
        options={options}
        error={bookingError}
        disabled={submitting}
      />
      <Textarea
        label="Note (optional)"
        name="note"
        rows={3}
        maxLength={FOOD_NOTE_MAX_LENGTH}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="For example: no chili, less ice"
        disabled={submitting}
      />
      <div aria-live="polite">
        <Alert type="error">{submitError}</Alert>
      </div>
      <Button type="submit" fullWidth loading={submitting} disabled={!canOrderLines(lines)}>
        Place order
      </Button>
      <p className="text-xs text-slate-500">
        The hotel confirms your order. You can cancel it while it is pending.
      </p>
    </form>
  );
}

// Phần đặt hàng cho khách đã đăng nhập: tải các đơn đã check-in để chọn phòng nhận đồ ăn.
// lines: các dòng giỏ hàng đã ghép với thực đơn. onOrdered: xóa giỏ sau khi đặt thành công.
export default function FoodOrderForm({ lines, initialBookingId = '', onOrdered }) {
  const bookingsRequest = useFetch(
    () => getMyBookings({ status: FOOD_ORDER_BOOKING_STATUS, limit: BOOKINGS_LIMIT }),
    [],
  );

  if (bookingsRequest.loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner size="sm" className="text-teal-700" /> Loading your bookings...
      </p>
    );
  }
  if (bookingsRequest.error) {
    return <ErrorState message={bookingsRequest.error.message} onRetry={bookingsRequest.retry} />;
  }

  const bookings = bookingsRequest.data.bookings;
  if (bookings.length === 0) {
    return <NoCheckedInBooking />;
  }
  return (
    <OrderFields
      lines={lines}
      bookings={bookings}
      initialBookingId={initialBookingId}
      onOrdered={onOrdered}
    />
  );
}
