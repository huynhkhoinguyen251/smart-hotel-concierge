import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getRoom } from '../api/rooms.api.js';
import BookingBox from '../components/rooms/BookingBox.jsx';
import RoomGallery from '../components/rooms/RoomGallery.jsx';
import RoomReviews from '../components/rooms/RoomReviews.jsx';
import Alert from '../components/ui/Alert.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import RatingStars from '../components/ui/RatingStars.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import useFetch from '../hooks/useFetch.js';
import formatCurrency from '../utils/formatCurrency.js';

// Không tìm thấy phòng (404), hoặc id không hợp lệ (400).
function RoomNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl font-bold text-teal-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Room not found</h1>
      <p className="mt-2 text-slate-600">This room does not exist or is no longer available.</p>
      <Link
        to="/rooms"
        className="mt-8 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Back to rooms
      </Link>
    </div>
  );
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: room, error, loading, retry } = useFetch(() => getRoom(id), [id]);

  if (loading) {
    return <PageSpinner />;
  }
  if (error) {
    if (error.status === 404 || error.status === 400) {
      return <RoomNotFound />;
    }
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ErrorState message={error.message} onRetry={retry} />
      </div>
    );
  }

  const { room_type: roomType } = room;
  const initialStay = {
    check_in: searchParams.get('check_in') ?? '',
    check_out: searchParams.get('check_out') ?? '',
    guests: searchParams.get('guests') ?? '',
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/rooms" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to rooms
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <RoomGallery
            key={room.id}
            images={room.images}
            alt={`${roomType.name}, room ${room.room_number}`}
          />

          {room.status === 'maintenance' && (
            <Alert type="error" className="mt-6">
              This room is under maintenance.
            </Alert>
          )}

          <div className="mt-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {roomType.name}
            </h1>
            <p className="mt-1 text-slate-500">
              Room {room.room_number} · Floor {room.floor}
            </p>

            <dl className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(roomType.price_per_night)}{' '}
                  <span className="text-sm font-normal text-slate-500">/ night</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Capacity
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  Up to {roomType.capacity} {roomType.capacity === 1 ? 'guest' : 'guests'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rating</dt>
                <dd className="mt-1 text-sm">
                  {room.review_count > 0 ? (
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <RatingStars rating={room.avg_rating} />
                      <span className="text-slate-500">({room.review_count})</span>
                    </span>
                  ) : (
                    <span className="text-slate-500">No reviews yet</span>
                  )}
                </dd>
              </div>
            </dl>

            {roomType.description && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">About this room</h2>
                <p className="mt-2 whitespace-pre-line text-slate-700">{roomType.description}</p>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Amenities</h2>
              {room.amenities.length > 0 ? (
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {room.amenities.map((amenity) => (
                    <li key={amenity.id} className="flex items-center gap-2 text-slate-700">
                      <span className="text-teal-600" aria-hidden="true">
                        ✓
                      </span>
                      {amenity.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No amenities listed.</p>
              )}
            </section>
          </div>

        </div>

        {/* Điện thoại: khung đặt phòng nằm giữa thông tin và đánh giá.
            Máy tính: nằm ở cột phải, kéo dài hết hai hàng để dính (sticky) khi cuộn. */}
        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <BookingBox key={room.id} room={room} initialStay={initialStay} />
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <RoomReviews key={room.id} roomId={room.id} />
        </div>
      </div>
    </div>
  );
}
