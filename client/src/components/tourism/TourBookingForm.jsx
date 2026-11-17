import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTourBooking } from '../../api/tourBookings.api.js';
import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  TOUR_BOOKING_CREATED_MESSAGE,
  TOURISM_NOTE_MAX_LENGTH,
} from '../../config/tourism.js';
import formatCurrency from '../../utils/formatCurrency.js';
import {
  estimateTourTotal,
  formatParticipants,
  getTourDateLimits,
  validateTourBooking,
} from '../../utils/tourismHelpers.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import QuantityControl from '../ui/QuantityControl.jsx';
import Textarea from '../ui/Textarea.jsx';

// Form đặt tour cho khách đã đăng nhập: ngày tour, số người, ghi chú và tổng tiền dự kiến.
export default function TourBookingForm({ tour }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tour_date: '', participants: MIN_PARTICIPANTS, note: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const limits = getTourDateLimits();

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateTourBooking(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createTourBooking({
        tour_id: tour.id,
        tour_date: form.tour_date,
        participants: form.participants,
        note: form.note.trim(),
      });
      navigate(`/my-trips/tours/${created.id}`, { state: { success: TOUR_BOOKING_CREATED_MESSAGE } });
    } catch (apiError) {
      // Ví dụ 400: ngày tour không hợp lệ; 404: tour vừa ngừng hoạt động.
      setSubmitError(apiError.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Book this tour">
      <Input
        label="Tour date"
        name="tour_date"
        type="date"
        min={limits.min}
        max={limits.max}
        value={form.tour_date}
        onChange={(event) => update('tour_date', event.target.value)}
        error={errors.tour_date}
        hint="From tomorrow, up to one year ahead"
        disabled={submitting}
      />
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">Participants</p>
        <QuantityControl
          quantity={form.participants}
          itemName="participants"
          onDecrease={() => update('participants', form.participants - 1)}
          onIncrease={() => update('participants', form.participants + 1)}
          decreaseDisabled={submitting || form.participants <= MIN_PARTICIPANTS}
          increaseDisabled={submitting || form.participants >= MAX_PARTICIPANTS}
        />
        <p className={`mt-1 text-xs ${errors.participants ? 'text-red-600' : 'text-slate-500'}`}>
          {errors.participants || `From ${MIN_PARTICIPANTS} to ${MAX_PARTICIPANTS} people`}
        </p>
      </div>
      <Textarea
        label="Note (optional)"
        name="note"
        rows={3}
        maxLength={TOURISM_NOTE_MAX_LENGTH}
        value={form.note}
        onChange={(event) => update('note', event.target.value)}
        placeholder="For example: pickup from the hotel lobby, a child in the group"
        disabled={submitting}
      />

      <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="font-semibold text-slate-900">Estimated total</p>
          <p className="text-xs text-slate-500">
            {formatCurrency(tour.price)} × {formatParticipants(form.participants)}
          </p>
        </div>
        <p className="text-right text-lg font-bold text-teal-700">
          {formatCurrency(estimateTourTotal(tour.price, form.participants))}
        </p>
      </div>

      <div aria-live="polite">
        <Alert type="error">{submitError}</Alert>
      </div>
      <Button type="submit" fullWidth loading={submitting}>
        Book tour
      </Button>
      <p className="text-xs text-slate-500">
        The hotel confirms your booking. You can cancel it while it is pending.
      </p>
    </form>
  );
}
