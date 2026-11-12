import { useState } from 'react';
import { Link } from 'react-router-dom';
import { checkAvailability } from '../../api/rooms.api.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { toQueryString } from '../../utils/queryString.js';
import {
  getStayDateLimits,
  getStayDatesError,
  getStayOrderError,
  guestOptions,
} from '../../utils/stayDates.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';

// Số khách từ địa chỉ trang, giới hạn trong 1..capacity.
const toGuestValue = (value, capacity) => {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1) return '1';
  return String(Math.min(count, capacity));
};

// Khung kiểm tra phòng trống. initialStay: ngày và số khách lấy từ địa chỉ trang.
// Đổi bất kỳ ô nào thì ẩn kết quả cũ, vì kết quả đó không còn đúng.
export default function BookingBox({ room, initialStay }) {
  const capacity = room.room_type.capacity;
  const [form, setForm] = useState({
    check_in: initialStay.check_in,
    check_out: initialStay.check_out,
    guests: toGuestValue(initialStay.guests, capacity),
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const { checkInMin, checkOutMin } = getStayDateLimits(form.check_in);
  const orderError = getStayOrderError(form);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setResult(null);
    setError('');
  };

  const handleCheck = async (event) => {
    event.preventDefault();
    const datesError = getStayDatesError(form, { required: true });
    if (datesError) {
      setError(datesError);
      return;
    }

    setError('');
    setResult(null);
    setChecking(true);
    try {
      const data = await checkAvailability(room.id, form);
      setResult(data);
    } catch (apiError) {
      // Ví dụ 400 "Check-out date must be after check-in date" hoặc quá 30 đêm.
      setError(apiError.message);
    } finally {
      setChecking(false);
    }
  };

  const bookingLink = `/book${toQueryString({ room_id: room.id, ...form })}`;

  return (
    <Card className="lg:sticky lg:top-24">
      <p>
        <span className="text-2xl font-bold text-teal-700">
          {formatCurrency(room.room_type.price_per_night)}
        </span>
        <span className="text-sm text-slate-500"> / night</span>
      </p>

      <form onSubmit={handleCheck} noValidate className="mt-5 space-y-4" aria-label="Check availability">
        <div className="grid gap-3">
          <Input
            label="Check-in"
            name="check_in"
            type="date"
            min={checkInMin}
            value={form.check_in}
            onChange={handleChange}
          />
          <Input
            label="Check-out"
            name="check_out"
            type="date"
            min={checkOutMin}
            value={form.check_out}
            onChange={handleChange}
          />
        </div>
        {orderError && <p className="-mt-2 text-xs text-red-600">{orderError}</p>}
        <Select
          label="Guests"
          name="guests"
          value={form.guests}
          onChange={handleChange}
          options={guestOptions(capacity)}
        />
        <Button type="submit" variant="secondary" fullWidth loading={checking}>
          Check availability
        </Button>
      </form>

      <div className="mt-4 space-y-3" aria-live="polite">
        <Alert type="error">{error}</Alert>
        {result && !result.available && <Alert type="error">{result.reason}</Alert>}
        {result?.available && (
          <>
            <Alert type="success">
              <p className="font-semibold">Available</p>
              <p className="mt-1">
                {result.nights} {result.nights === 1 ? 'night' : 'nights'} ×{' '}
                {formatCurrency(result.price_per_night)}
              </p>
              <p className="mt-1">
                Estimated total:{' '}
                <span className="font-semibold">{formatCurrency(result.estimated_total)}</span>
              </p>
            </Alert>
            <Link
              to={bookingLink}
              className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Book now
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
