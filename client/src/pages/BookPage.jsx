import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createBooking } from '../api/bookings.api.js';
import { checkAvailability, getRoom } from '../api/rooms.api.js';
import StayFields from '../components/bookings/StayFields.jsx';
import RoomImage from '../components/rooms/RoomImage.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Spinner, { PageSpinner } from '../components/ui/Spinner.jsx';
import useAuth from '../hooks/useAuth.js';
import useFetch from '../hooks/useFetch.js';
import {
  ADMIN_BOOKING_NOTE,
  BOOKING_CREATED_MESSAGE,
  clampGuests,
} from '../utils/bookingHelpers.js';
import { CHECK_IN_TIME, getFreeCancellationDeadline } from '../utils/cancellation.js';
import { countNights } from '../utils/dateHelpers.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { cleanParams, toQueryString } from '../utils/queryString.js';
import { getStayDatesError } from '../utils/stayDates.js';

const ROOM_ID_PATTERN = /^[1-9]\d*$/;

// Khung báo lỗi kèm link quay lại (thiếu phòng, phòng không tồn tại...).
function BookingProblem({ title, message, to, linkLabel }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <Link
        to={to}
        className="mt-8 inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function SummaryRow({ label, children, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-slate-600">{label}</dt>
      <dd className={`text-right ${strong ? 'text-lg font-bold text-teal-700' : 'font-medium text-slate-900'}`}>
        {children}
      </dd>
    </div>
  );
}

// Trạng thái phòng trống cho ngày đang chọn.
function AvailabilityStatus({ datesError, availability }) {
  if (datesError) return <Alert type="info">{datesError}</Alert>;
  if (availability.loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner size="sm" className="text-teal-700" /> Checking availability...
      </p>
    );
  }
  if (availability.error) return <Alert type="error">{availability.error.message}</Alert>;
  if (!availability.data) return null;
  return availability.data.available ? (
    <Alert type="success">This room is available for your dates.</Alert>
  ) : (
    <Alert type="error">{availability.data.reason}</Alert>
  );
}

// Form đặt phòng. Ngày và số khách nằm trên địa chỉ trang, nên tải lại trang
// (hoặc quay lại sau khi đăng nhập) vẫn giữ lựa chọn.
function BookingForm({ roomId }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const stay = {
    check_in: searchParams.get('check_in') ?? '',
    check_out: searchParams.get('check_out') ?? '',
    guests: searchParams.get('guests') ?? '',
  };
  const datesError = getStayDatesError(stay, { required: true });

  const roomRequest = useFetch(() => getRoom(roomId), [roomId]);
  // Tự kiểm tra lại phòng trống mỗi khi đổi ngày.
  const availability = useFetch(
    () => (datesError ? Promise.resolve(null) : checkAvailability(roomId, stay)),
    [roomId, stay.check_in, stay.check_out],
  );

  if (roomRequest.loading) return <PageSpinner />;
  if (roomRequest.error) {
    if ([400, 404].includes(roomRequest.error.status)) {
      return (
        <BookingProblem
          title="Room not found"
          message="This room does not exist or is no longer available."
          to="/rooms"
          linkLabel="Back to rooms"
        />
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={roomRequest.error.message} onRetry={roomRequest.retry} />
      </div>
    );
  }

  const room = roomRequest.data;
  const capacity = room.room_type.capacity;
  const guests = clampGuests(stay.guests, capacity);
  const guestsReduced = Number(stay.guests) > capacity;
  const nights = countNights(stay.check_in, stay.check_out);
  const pricePerNight = availability.data?.price_per_night ?? room.room_type.price_per_night;
  const total = availability.data?.estimated_total ?? nights * pricePerNight;
  const deadline = getFreeCancellationDeadline(stay.check_in);
  const roomLink = `/rooms/${room.id}${toQueryString({ ...stay, guests })}`;

  const canConfirm =
    !datesError && !availability.loading && availability.data?.available === true && !submitting;

  const handleChange = (name, value) => {
    setSubmitError('');
    setSearchParams(cleanParams({ room_id: roomId, ...stay, guests, [name]: value }), {
      replace: true,
    });
  };

  const handleConfirm = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const booking = await createBooking({
        room_id: room.id,
        check_in: stay.check_in,
        check_out: stay.check_out,
        guests: Number(guests),
      });
      // replace: bấm Back sau khi đặt không quay lại form này để đặt lần nữa.
      navigate(`/my-bookings/${booking.id}`, {
        replace: true,
        state: { success: BOOKING_CREATED_MESSAGE },
      });
    } catch (error) {
      // Ví dụ 409: người khác vừa đặt phòng này; kiểm tra lại để cập nhật trạng thái.
      setSubmitError(error.message);
      setSubmitting(false);
      if (error.status === 409) availability.retry();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to={roomLink} className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to room
      </Link>
      <PageTitle title="Book your stay" subtitle="Check the details below, then confirm." className="mt-3" />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card className="flex flex-col gap-4 sm:flex-row">
            <RoomImage
              src={room.primary_image}
              alt={`${room.room_type.name}, room ${room.room_number}`}
              className="aspect-[4/3] w-full rounded-xl sm:w-48 sm:shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900">{room.room_type.name}</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Room {room.room_number} · Floor {room.floor}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Up to {capacity} {capacity === 1 ? 'guest' : 'guests'} ·{' '}
                {formatCurrency(room.room_type.price_per_night)} / night
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Your stay</h2>
            <StayFields
              values={{ ...stay, guests }}
              capacity={capacity}
              onChange={handleChange}
              disabled={submitting}
            />
            {guestsReduced && (
              <p className="mt-3 text-sm text-amber-700">
                This room allows at most {capacity} {capacity === 1 ? 'guest' : 'guests'}.
              </p>
            )}
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-slate-900">Booking summary</h2>
          <dl className="mt-3 divide-y divide-slate-100 text-sm">
            <SummaryRow label="Check-in">
              {stay.check_in ? `${formatDate(stay.check_in)}, from ${CHECK_IN_TIME}` : '-'}
            </SummaryRow>
            <SummaryRow label="Check-out">{stay.check_out ? formatDate(stay.check_out) : '-'}</SummaryRow>
            <SummaryRow label="Guests">{guests}</SummaryRow>
            {!datesError && (
              <>
                <SummaryRow label="Price">
                  {formatCurrency(pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}
                </SummaryRow>
                <SummaryRow label="Total" strong>
                  {formatCurrency(total)}
                </SummaryRow>
              </>
            )}
          </dl>

          <div className="mt-4 space-y-3" aria-live="polite">
            <AvailabilityStatus datesError={datesError} availability={availability} />
            <Alert type="error">{submitError}</Alert>
          </div>

          <Button fullWidth className="mt-4" disabled={!canConfirm} loading={submitting} onClick={handleConfirm}>
            Confirm booking
          </Button>

          {!datesError && deadline && (
            <p className="mt-3 text-xs text-slate-500">
              Free cancellation until {deadline.label}. The hotel confirms your booking after you
              submit it.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// /book?room_id=5&check_in=...&check_out=...&guests=2 (chỉ cho người đã đăng nhập).
export default function BookPage() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room_id') ?? '';
  const validRoomId = ROOM_ID_PATTERN.test(roomId);

  // Admin không được đặt phòng: không hiện form, không gọi POST /bookings.
  if (isAdmin) {
    const stay = cleanParams({
      check_in: searchParams.get('check_in'),
      check_out: searchParams.get('check_out'),
      guests: searchParams.get('guests'),
    });
    return (
      <BookingProblem
        title="Booking not available"
        message={ADMIN_BOOKING_NOTE}
        to={validRoomId ? `/rooms/${roomId}${toQueryString(stay)}` : '/rooms'}
        linkLabel={validRoomId ? 'Back to room' : 'Back to rooms'}
      />
    );
  }

  if (!validRoomId) {
    return (
      <BookingProblem
        title="No room selected"
        message="Choose a room and your dates first."
        to="/rooms"
        linkLabel="Find a room"
      />
    );
  }
  return <BookingForm key={roomId} roomId={roomId} />;
}
