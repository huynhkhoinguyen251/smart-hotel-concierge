import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTransportBooking } from '../../api/transportBookings.api.js';
import {
  FLIGHT_NUMBER_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  MAX_RENTAL_DAYS,
  TOURISM_NOTE_MAX_LENGTH,
  TRANSPORT_BOOKING_CREATED_MESSAGE,
} from '../../config/tourism.js';
import formatCurrency from '../../utils/formatCurrency.js';
import {
  buildTransportPayload,
  estimateTransportTotal,
  formatDays,
  formatTransportQuantity,
  getInitialTransportForm,
  getRentalDays,
  getStartTimeLimits,
  getTransportCategory,
  validateTransportBooking,
} from '../../utils/tourismHelpers.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import QuantityControl from '../ui/QuantityControl.jsx';
import Textarea from '../ui/Textarea.jsx';

// Dòng tổng tiền dự kiến. Thuê xe máy: giá × số ngày; hai loại còn lại: giá × số lượng.
function EstimatedTotal({ service, form, isMotorbike }) {
  const total = estimateTransportTotal(service, form);
  const days = getRentalDays(form.start_at, form.end_at);
  let detail = `${formatCurrency(service.price)} × ${formatTransportQuantity(form.quantity, service.category)}`;
  if (isMotorbike) {
    detail =
      days >= 1 && days <= MAX_RENTAL_DAYS
        ? `${formatCurrency(service.price)} × ${formatDays(days)}`
        : 'Choose the pick-up and return times';
  }

  return (
    <div className="flex items-start justify-between gap-4 border-t border-line-soft pt-4">
      <div>
        <p className="font-semibold text-ink">Estimated total</p>
        <p className="text-xs text-ink-soft">{detail}</p>
      </div>
      <p className="text-right text-lg font-bold text-ink">
        {total === null ? '-' : formatCurrency(total)}
      </p>
    </div>
  );
}

// Form đặt vận chuyển. Các ô thay đổi theo loại:
// thuê xe máy (giờ nhận, giờ trả), đón sân bay (số hiệu chuyến bay, số xe), xe đưa đón (số người).
export default function TransportBookingForm({ service }) {
  const navigate = useNavigate();
  const category = getTransportCategory(service.category);
  const isMotorbike = service.category === 'motorbike_rental';
  const isAirport = service.category === 'airport_pickup';

  const [form, setForm] = useState(() => getInitialTransportForm(service.category));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const limits = getStartTimeLimits();
  const rentalDays = isMotorbike ? getRentalDays(form.start_at, form.end_at) : 0;

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
  };
  const handleChange = (event) => update(event.target.name, event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateTransportBooking(service.category, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createTransportBooking(buildTransportPayload(service, form));
      navigate(`/my-trips/transport/${created.id}`, {
        state: { success: TRANSPORT_BOOKING_CREATED_MESSAGE },
      });
    } catch (apiError) {
      // Ví dụ 400: giờ đã qua, thuê quá 30 ngày; 404: dịch vụ vừa ngừng hoạt động.
      setSubmitError(apiError.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Book this transport">
      {isAirport && (
        <Input
          label="Flight number"
          name="flight_number"
          value={form.flight_number}
          onChange={handleChange}
          maxLength={FLIGHT_NUMBER_MAX_LENGTH}
          placeholder="For example: VN 123"
          error={errors.flight_number}
          disabled={submitting}
        />
      )}
      <Input
        label={category.fields.start}
        name="start_at"
        type="datetime-local"
        min={limits.min}
        max={limits.max}
        value={form.start_at}
        onChange={handleChange}
        error={errors.start_at}
        disabled={submitting}
      />
      {isMotorbike && (
        <Input
          label={category.fields.end}
          name="end_at"
          type="datetime-local"
          min={form.start_at || limits.min}
          value={form.end_at}
          onChange={handleChange}
          error={errors.end_at}
          hint={
            rentalDays > 0
              ? `Rental: ${formatDays(rentalDays)} (every started 24 hours counts as 1 day, up to ${MAX_RENTAL_DAYS} days)`
              : `Every started 24 hours counts as 1 day, up to ${MAX_RENTAL_DAYS} days`
          }
          disabled={submitting}
        />
      )}
      {category.quantity && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">{category.quantity.label}</p>
          <QuantityControl
            quantity={form.quantity}
            itemName={category.quantity.label.toLowerCase()}
            onDecrease={() => update('quantity', form.quantity - 1)}
            onIncrease={() => update('quantity', form.quantity + 1)}
            decreaseDisabled={submitting || form.quantity <= category.quantity.min}
            increaseDisabled={submitting || form.quantity >= category.quantity.max}
          />
          <p className={`mt-1 text-xs ${errors.quantity ? 'text-danger' : 'text-ink-soft'}`}>
            {errors.quantity || `From ${category.quantity.min} to ${category.quantity.max}`}
          </p>
        </div>
      )}
      <Input
        label={category.fields.pickup}
        name="pickup_location"
        value={form.pickup_location}
        onChange={handleChange}
        maxLength={LOCATION_MAX_LENGTH}
        placeholder="For example: Smart Hotel Concierge lobby"
        error={errors.pickup_location}
        disabled={submitting}
      />
      <Input
        label={category.fields.dropoff}
        name="dropoff_location"
        value={form.dropoff_location}
        onChange={handleChange}
        maxLength={LOCATION_MAX_LENGTH}
        placeholder="For example: Han Market"
        error={errors.dropoff_location}
        disabled={submitting}
      />
      <Textarea
        label="Note (optional)"
        name="note"
        rows={3}
        maxLength={TOURISM_NOTE_MAX_LENGTH}
        value={form.note}
        onChange={handleChange}
        placeholder="Anything the hotel should know"
        disabled={submitting}
      />

      <EstimatedTotal service={service} form={form} isMotorbike={isMotorbike} />

      <div aria-live="polite">
        <Alert type="error">{submitError}</Alert>
      </div>
      <Button type="submit" fullWidth loading={submitting}>
        Send request
      </Button>
      <p className="text-xs text-ink-soft">
        The hotel confirms your request. You can cancel it while it is pending.
      </p>
    </form>
  );
}
