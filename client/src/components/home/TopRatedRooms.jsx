import { Link } from 'react-router-dom';
import { getRooms } from '../../api/rooms.api.js';
import { formatGuests } from '../../utils/bookingHelpers.js';
import RoomRating from '../rooms/RoomRating.jsx';
import Bone, { BoneGroup } from '../ui/Bone.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';
import HomeSection from './HomeSection.jsx';

// Cột trái rộng hơn cột phải; hai cột cao bằng nhau (ảnh lớn giãn theo cột phải).
const GRID = 'grid gap-x-8 gap-y-10 lg:grid-cols-[1.65fr_1fr]';
const SMALL_PHOTO = 'aspect-[4/3] sm:aspect-[16/9]';

// large: phòng đứng đầu, ảnh lớn.
function RoomTile({ room, large = false }) {
  const { room_type: roomType } = room;
  return (
    <Link to={`/rooms/${room.id}`} className="group flex flex-col rounded-panel">
      <PhotoFrame
        src={room.primary_image}
        alt={`${roomType.name}, room ${room.room_number}`}
        className={large ? 'aspect-[4/3] lg:aspect-auto lg:flex-1' : SMALL_PHOTO}
      />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
        <div>
          <h3
            className={`font-semibold text-ink transition-colors duration-150 group-hover:text-sea ${large ? 'text-2xl' : 'text-lg'}`}
          >
            {roomType.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Room {room.room_number} · Up to {formatGuests(roomType.capacity)}
          </p>
        </div>
        <div className="sm:text-right">
          <Price amount={roomType.price_per_night} unit="/ night" className={large ? 'block text-lg' : 'block'} />
          <RoomRating room={room} />
        </div>
      </div>
    </Link>
  );
}

function RoomsSkeleton() {
  return (
    <BoneGroup className={GRID}>
      <div className="flex flex-col">
        <Bone className="aspect-[4/3] lg:aspect-auto lg:flex-1" />
        <Bone className="mt-4 h-14 w-64 max-w-full" />
      </div>
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-1">
        {[1, 2].map((tile) => (
          <div key={tile}>
            <Bone className={SMALL_PHOTO} />
            <Bone className="mt-4 h-13 w-48" />
          </div>
        ))}
      </div>
    </BoneGroup>
  );
}

// Ba phòng có điểm đánh giá cao nhất: một ảnh lớn và hai ảnh nhỏ bên cạnh.
export default function TopRatedRooms() {
  return (
    <HomeSection
      title="Top rated rooms"
      to="/rooms"
      linkLabel="View all rooms"
      load={() => getRooms({ sort: 'rating_desc', limit: 3 })}
      skeleton={<RoomsSkeleton />}
    >
      {({ rooms }) => {
        if (rooms.length === 0) return <EmptyState title="No rooms available right now" />;
        const [first, ...rest] = rooms;
        return (
          <div className={rest.length > 0 ? GRID : ''}>
            <RoomTile room={first} large />
            {rest.length > 0 && (
              <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-1">
                {rest.map((room) => (
                  <RoomTile key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        );
      }}
    </HomeSection>
  );
}
