import { Link, useSearchParams } from 'react-router-dom';
import { getRoom } from '../api/rooms.api.js';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import useFetch from '../hooks/useFetch.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import { toQueryString } from '../utils/queryString.js';

// Trang tạm cho form đặt phòng (làm ở bước sau). Chỉ hiện phòng và ngày đã chọn,
// để kiểm tra luồng: chưa đăng nhập thì sang /login, đăng nhập xong quay lại đúng địa chỉ này.
export default function BookPage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room_id') ?? '';
  const stay = {
    check_in: searchParams.get('check_in') ?? '',
    check_out: searchParams.get('check_out') ?? '',
    guests: searchParams.get('guests') ?? '',
  };

  const { data: room, error, loading, retry } = useFetch(
    () => (roomId ? getRoom(roomId) : Promise.resolve(null)),
    [roomId],
  );

  const renderRoom = () => {
    if (!roomId) {
      return (
        <p className="text-slate-600">
          No room selected.{' '}
          <Link to="/rooms" className="font-semibold text-teal-700 hover:text-teal-800">
            Choose a room
          </Link>
        </p>
      );
    }
    if (loading) return <PageSpinner />;
    if (error) return <ErrorState message={error.message} onRetry={retry} />;

    return (
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Room</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {room.room_type.name} · Room {room.room_number}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {formatCurrency(room.room_type.price_per_night)} / night
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Dates</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {stay.check_in && stay.check_out
              ? `${formatDate(stay.check_in)} to ${formatDate(stay.check_out)}`
              : 'Not selected'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Guests</dt>
          <dd className="mt-1 font-semibold text-slate-900">{stay.guests || 'Not selected'}</dd>
        </div>
      </dl>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageTitle title="Book a room" />
      <Card>
        {renderRoom()}
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <p className="font-semibold text-slate-800">Booking form coming soon</p>
          <p className="mt-1 text-sm text-slate-500">You will be able to confirm your booking here.</p>
        </div>
        {roomId && (
          <Link
            to={`/rooms/${roomId}${toQueryString(stay)}`}
            className="mt-6 inline-block text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            ← Back to room
          </Link>
        )}
      </Card>
    </div>
  );
}
