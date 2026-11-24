import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getRoom } from '../api/rooms.api.js';
import AmenityIcon from '../components/rooms/AmenityIcon.jsx';
import BookingBox from '../components/rooms/BookingBox.jsx';
import RoomGallery from '../components/rooms/RoomGallery.jsx';
import RoomRating from '../components/rooms/RoomRating.jsx';
import RoomReviews from '../components/rooms/RoomReviews.jsx';
import Alert from '../components/ui/Alert.jsx';
import BackLink from '../components/ui/BackLink.jsx';
import Bone, { BoneGroup } from '../components/ui/Bone.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import Price from '../components/ui/Price.jsx';
import useFetch from '../hooks/useFetch.js';
import usePageTitle from '../hooks/usePageTitle.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import { formatGuests } from '../utils/bookingHelpers.js';

const BOOKING_ID = 'booking-box';

function RoomSkeleton() {
  return (
    <BoneGroup className="shell py-8">
      <Bone className="h-5 w-28" />
      <Bone className="mt-4 aspect-[4/3] w-full sm:aspect-auto sm:h-[clamp(20rem,36vw,30rem)]" />
      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <Bone className="h-9 w-64 max-w-full" />
          <Bone className="mt-4 h-5 w-full max-w-lg" />
          <Bone className="mt-10 h-24 w-full max-w-lg" />
        </div>
        <Bone className="h-96" />
      </div>
    </BoneGroup>
  );
}

// Các thông tin chính trên một dòng (tự xuống dòng trên điện thoại).
function RoomFacts({ room }) {
  const { room_type: roomType } = room;
  const facts = [
    { label: 'Room', value: `Room ${room.room_number}` },
    { label: 'Floor', value: `Floor ${room.floor}` },
    { label: 'Capacity', value: `Up to ${formatGuests(roomType.capacity)}` },
    { label: 'Price', value: <Price amount={roomType.price_per_night} unit="/ night" /> },
    { label: 'Rating', value: <RoomRating room={room} long /> },
  ];
  return (
    <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-ink">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="sr-only">{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Điện thoại: thanh giá ở đáy màn hình, bấm để tới khung đặt phòng.
// Khung đặt phòng đã nằm trong màn hình thì thanh ẩn đi (vẫn giữ chỗ để trang không giật).
function MobileBookingBar({ price }) {
  const reducedMotion = useReducedMotion();
  const [boxVisible, setBoxVisible] = useState(false);

  useEffect(() => {
    const box = document.getElementById(BOOKING_ID);
    if (!box) return undefined;
    const observer = new IntersectionObserver(([entry]) => setBoxVisible(entry.isIntersecting));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const goToBox = () => {
    document
      .getElementById(BOOKING_ID)
      ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('booking-heading')?.focus({ preventScroll: true });
  };

  return (
    <div
      className={`sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-line-soft bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6 lg:hidden ${
        boxVisible ? 'invisible' : ''
      }`}
    >
      <Price amount={price} unit="/ night" />
      <Button onClick={goToBox}>Check availability</Button>
    </div>
  );
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: room, error, loading, retry } = useFetch(() => getRoom(id), [id]);
  usePageTitle(!loading && room ? `${room.room_type.name}, room ${room.room_number}` : '');

  if (loading) {
    return <RoomSkeleton />;
  }
  if (error) {
    // Không tìm thấy phòng (404), hoặc id không hợp lệ (400).
    if (error.status === 404 || error.status === 400) {
      return (
        <NotFoundView
          title="Room not found"
          message="This room does not exist or is no longer available."
          to="/rooms"
          linkLabel="Back to rooms"
        />
      );
    }
    return (
      <div className="shell py-10">
        <h1 className="sr-only">Could not load this page</h1>
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
    <div className="shell pt-6 lg:pb-16">
      <BackLink to="/rooms">Back to rooms</BackLink>

      <div className="mt-4">
        <RoomGallery
          key={room.id}
          images={room.images}
          alt={`${roomType.name}, room ${room.room_number}`}
        />
      </div>

      <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {room.status === 'maintenance' && (
            <Alert type="error" className="mb-6">
              This room is under maintenance.
            </Alert>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{roomType.name}</h1>
          <RoomFacts room={room} />

          {roomType.description && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-ink">About this room</h2>
              <p className="mt-2 max-w-prose whitespace-pre-line text-ink">{roomType.description}</p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-ink">Amenities</h2>
            {room.amenities.length > 0 ? (
              <ul className="mt-4 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {room.amenities.map((amenity) => (
                  <li key={amenity.id} className="flex items-center gap-3 text-ink">
                    <AmenityIcon name={amenity.name} className="size-6" />
                    <span className="min-w-0 break-words">{amenity.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">No amenities listed.</p>
            )}
          </section>
        </div>

        {/* Điện thoại: khung đặt phòng nằm giữa thông tin và đánh giá.
            Máy tính: nằm ở cột phải, kéo dài hết hai hàng để dính (sticky) khi cuộn. */}
        <aside id={BOOKING_ID} className="scroll-mt-20 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <BookingBox key={room.id} room={room} initialStay={initialStay} />
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <RoomReviews key={room.id} roomId={room.id} />
        </div>
      </div>

      <MobileBookingBar key={room.id} price={roomType.price_per_night} />
    </div>
  );
}
