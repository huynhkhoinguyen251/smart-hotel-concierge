import { useState } from 'react';
import { updateBooking } from '../../api/bookings.api.js';
import { checkAvailability, getRoom } from '../../api/rooms.api.js';
import useFetch from '../../hooks/useFetch.js';
import { staysOverlap } from '../../utils/bookingHelpers.js';
import { getStayDatesError } from '../../utils/stayDates.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import StayFields from './StayFields.jsx';

// Form đổi ngày hoặc số khách của đơn còn pending. onSaved(booking mới), onCancel() đóng form.
export default function EditBookingForm({ booking, onSaved, onCancel }) {
  // Sức chứa lấy từ GET /rooms/:id. Không tải được thì chỉ cho giảm số khách.
  const roomRequest = useFetch(() => getRoom(booking.room.id), [booking.room.id]);
  const capacity = roomRequest.data?.room_type.capacity ?? booking.guests;

  const [form, setForm] = useState({
    check_in: booking.check_in,
    check_out: booking.check_out,
    guests: String(booking.guests),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const datesChanged = form.check_in !== booking.check_in || form.check_out !== booking.check_out;
  const guestsChanged = Number(form.guests) !== booking.guests;

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!datesChanged && !guestsChanged) {
      setError('Change the dates or the number of guests first.');
      return;
    }
    if (datesChanged) {
      const datesError = getStayDatesError(form, { required: true });
      if (datesError) {
        setError(datesError);
        return;
      }
    }

    setError('');
    setSaving(true);
    try {
      // Kiểm tra phòng trống trước khi lưu. API kiểm tra phòng trống không bỏ qua chính đơn này,
      // nên chỉ kiểm tra trước khi ngày mới không trùng ngày cũ; nếu trùng thì để backend
      // kiểm tra khi lưu (backend trả 409 nếu phòng đã bị người khác đặt).
      if (datesChanged && !staysOverlap(form, booking)) {
        const availability = await checkAvailability(booking.room.id, form);
        if (!availability.available) {
          setError(availability.reason);
          setSaving(false);
          return;
        }
      }

      const changes = {};
      if (datesChanged) {
        changes.check_in = form.check_in;
        changes.check_out = form.check_out;
      }
      if (guestsChanged) changes.guests = Number(form.guests);

      onSaved(await updateBooking(booking.id, changes));
    } catch (apiError) {
      setError(apiError.message);
      setSaving(false);
    }
  };

  if (roomRequest.loading) {
    return (
      <div className="flex justify-center py-6 text-teal-700">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Change dates or guests" className="space-y-4">
      <StayFields values={form} capacity={capacity} onChange={handleChange} disabled={saving} />
      {roomRequest.error && (
        <p className="text-xs text-amber-700">
          Could not load the room capacity, so you can only keep or reduce the number of guests.
        </p>
      )}
      <p className="text-xs text-slate-500">
        We check that the room is free for your new dates before saving. The price per night stays
        the same as when you booked.
      </p>
      <Alert type="error">{error}</Alert>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
        <Button variant="secondary" disabled={saving} onClick={onCancel}>
          Close
        </Button>
      </div>
    </form>
  );
}
