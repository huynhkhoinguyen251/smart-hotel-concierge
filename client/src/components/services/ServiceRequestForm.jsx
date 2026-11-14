import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings.api.js';
import { createServiceBooking } from '../../api/serviceBookings.api.js';
import {
  MAX_SERVICE_QUANTITY,
  MIN_SERVICE_QUANTITY,
  SERVICE_ELIGIBLE_BOOKING_STATUSES,
  SERVICE_NOTE_MAX_LENGTH,
  SERVICE_REQUEST_CREATED_MESSAGE,
} from '../../config/services.js';
import { getStatusConfig } from '../../config/statuses.js';
import useFetch from '../../hooks/useFetch.js';
import formatCurrency from '../../utils/formatCurrency.js';
import formatDate from '../../utils/formatDate.js';
import {
  formatQuantity,
  getBookingOptionLabel,
  getEligibleBookings,
  getScheduleError,
  getScheduleLimits,
  getServiceCategory,
  toApiDateTime,
} from '../../utils/serviceHelpers.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Spinner from '../ui/Spinner.jsx';
import Textarea from '../ui/Textarea.jsx';

// Mỗi trạng thái lấy tối đa 50 đơn (giới hạn limit của backend); khách thường chỉ có vài đơn.
const BOOKINGS_LIMIT = 50;

const LINK_CLASS =
  'inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50';

// Không có đơn nào phù hợp với loại dịch vụ này.
function NoEligibleBooking({ category }) {
  const statuses = category.bookingStatuses.map((status) => getStatusConfig(status).label.toLowerCase());
  const duringStayOnly = category.bookingStatuses.length === 1;
  return (
    <div className="space-y-4">
      <Alert type="info">
        {duringStayOnly
          ? `${category.label} is available only during your stay, after you have checked in. You have no ${statuses[0]} room booking right now.`
          : `You need a ${statuses.join(' or ')} room booking with time left in your stay to request this service.`}
      </Alert>
      <div className="flex flex-wrap gap-2">
        <Link to="/rooms" className={LINK_CLASS}>
          Find a room
        </Link>
        <Link to="/my-bookings" className={LINK_CLASS}>
          My bookings
        </Link>
      </div>
    </div>
  );
}

// Các ô của form. bookings: chỉ gồm các đơn dùng được cho loại dịch vụ này.
function RequestFields({ service, category, bookings, initialBookingId }) {
  const navigate = useNavigate();
  const preselected = bookings.find((booking) => String(booking.id) === initialBookingId);
  const [form, setForm] = useState({
    booking_id: String((preselected ?? bookings[0]).id),
    scheduled_at: '',
    quantity: String(MIN_SERVICE_QUANTITY),
    note: '',
  });
  const [scheduleError, setScheduleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const booking = bookings.find((item) => String(item.id) === form.booking_id) ?? bookings[0];
  const limits = getScheduleLimits(booking);
  const quantity = Number(form.quantity);
  const bookingNotUsable = Boolean(initialBookingId) && !preselected;

  const bookingOptions = bookings.map((item) => ({
    value: String(item.id),
    label: getBookingOptionLabel(item),
  }));
  const quantityOptions = Array.from(
    { length: MAX_SERVICE_QUANTITY - MIN_SERVICE_QUANTITY + 1 },
    (_, index) => {
      const count = MIN_SERVICE_QUANTITY + index;
      return { value: String(count), label: formatQuantity(count, service.category) };
    },
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSubmitError('');
    if (name === 'scheduled_at') setScheduleError('');
    setForm((current) => {
      const next = { ...current, [name]: value };
      // Đổi đơn: giờ đã chọn nằm ngoài thời gian lưu trú mới thì xóa đi.
      if (name === 'booking_id' && current.scheduled_at) {
        const nextBooking = bookings.find((item) => String(item.id) === value);
        const nextLimits = nextBooking && getScheduleLimits(nextBooking);
        if (getScheduleError(current.scheduled_at, nextLimits)) next.scheduled_at = '';
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = getScheduleError(form.scheduled_at, limits);
    if (error) {
      setScheduleError(error);
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      const created = await createServiceBooking({
        booking_id: booking.id,
        service_id: service.id,
        scheduled_at: toApiDateTime(form.scheduled_at),
        quantity,
        note: form.note.trim(),
      });
      navigate(`/my-services/${created.id}`, { state: { success: SERVICE_REQUEST_CREATED_MESSAGE } });
    } catch (apiError) {
      // Ví dụ 400: đơn chưa check-in, hoặc giờ hẹn nằm ngoài thời gian lưu trú.
      setSubmitError(apiError.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Book this service">
      {bookingNotUsable && (
        <Alert type="info">
          Booking #{initialBookingId} cannot be used for {category.label.toLowerCase()}. Choose
          another booking below.
        </Alert>
      )}
      <Select
        label="Room booking"
        name="booking_id"
        value={form.booking_id}
        onChange={handleChange}
        options={bookingOptions}
        disabled={submitting}
      />
      <Input
        label="Date and time"
        name="scheduled_at"
        type="datetime-local"
        min={limits?.min}
        max={limits?.max}
        value={form.scheduled_at}
        onChange={handleChange}
        error={scheduleError}
        hint={
          limits
            ? `Within your stay: ${formatDate(limits.stayStart, { withTime: true })} to ${formatDate(limits.max, { withTime: true })}`
            : ''
        }
        disabled={submitting}
      />
      <Select
        label="Quantity"
        name="quantity"
        value={form.quantity}
        onChange={handleChange}
        options={quantityOptions}
        disabled={submitting}
      />
      <Textarea
        label="Note (optional)"
        name="note"
        rows={3}
        maxLength={SERVICE_NOTE_MAX_LENGTH}
        value={form.note}
        onChange={handleChange}
        placeholder="Anything the hotel should know"
        disabled={submitting}
      />

      <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="font-semibold text-slate-900">Total</p>
          <p className="text-xs text-slate-500">
            {formatCurrency(service.price)} × {formatQuantity(quantity, service.category)}
          </p>
        </div>
        <p className="text-right text-lg font-bold text-teal-700">
          {formatCurrency(service.price * quantity)}
        </p>
      </div>

      <div aria-live="polite">
        <Alert type="error">{submitError}</Alert>
      </div>
      <Button type="submit" fullWidth loading={submitting}>
        Send request
      </Button>
      <p className="text-xs text-slate-500">
        The hotel confirms your request. You can cancel it while it is pending.
      </p>
    </form>
  );
}

// Form đặt dịch vụ cho khách đã đăng nhập. Tải các đơn confirmed và checked_in của tôi,
// rồi chỉ giữ các đơn mà loại dịch vụ này cho phép.
export default function ServiceRequestForm({ service, initialBookingId = '' }) {
  const category = getServiceCategory(service.category);
  const bookingsRequest = useFetch(async () => {
    const results = await Promise.all(
      SERVICE_ELIGIBLE_BOOKING_STATUSES.map((status) =>
        getMyBookings({ status, limit: BOOKINGS_LIMIT }),
      ),
    );
    return results.flatMap((result) => result.bookings);
  }, []);

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

  const bookings = getEligibleBookings(bookingsRequest.data, service.category);
  if (bookings.length === 0) {
    return <NoEligibleBooking category={category} />;
  }
  return (
    <RequestFields
      service={service}
      category={category}
      bookings={bookings}
      initialBookingId={initialBookingId}
    />
  );
}
