import { formatGuests } from '../../utils/bookingHelpers.js';
import { toQueryString } from '../../utils/queryString.js';
import ButtonLink from '../ui/ButtonLink.jsx';
import PhotoFrame from '../ui/PhotoFrame.jsx';
import Price from '../ui/Price.jsx';
import AmenityIcon from './AmenityIcon.jsx';
import RoomRating from './RoomRating.jsx';

// Một dòng phòng trong danh sách: ảnh bên trái, thông tin ở giữa, giá và nút bên phải.
// Cả dòng bấm được (link của nút phủ lên cả dòng).
// stay: { check_in, check_out, guests } được gắn vào link chi tiết, để trang chi tiết điền sẵn ngày.
// details: { description, amenities } của loại phòng, tải riêng nên có thể chưa có.
export default function RoomCard({ room, stay, details }) {
  const { room_type: roomType } = room;
  const label = `${roomType.name}, room ${room.room_number}`;

  return (
    <article className="group relative grid gap-4 py-6 sm:grid-cols-[2fr_3fr] sm:gap-6">
      <PhotoFrame src={room.primary_image} alt={label} className="aspect-[4/3] sm:aspect-auto sm:min-h-64" />

      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:gap-6 lg:flex-col xl:flex-row">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-ink transition-colors duration-150 group-hover:text-sea">
            {roomType.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Room {room.room_number} · Floor {room.floor} · Up to {formatGuests(roomType.capacity)}
          </p>
          <div className="mt-2">
            <RoomRating room={room} long />
          </div>
          {details?.description && <p className="mt-3 max-w-prose text-sm text-ink">{details.description}</p>}
          {details?.amenities.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink" aria-label="Amenities">
              {details.amenities.map((amenity) => (
                <li key={amenity.id} className="flex items-center gap-2">
                  <AmenityIcon name={amenity.name} className="size-4.5" />
                  {amenity.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 md:w-40 md:shrink-0 md:flex-col lg:w-auto lg:flex-row xl:w-40 xl:flex-col">
          <p className="md:text-right lg:text-left xl:text-right">
            <Price amount={roomType.price_per_night} className="block text-lg" />
            <span className="block text-sm text-ink-soft">/ night</span>
          </p>
          <ButtonLink
            to={`/rooms/${room.id}${toQueryString(stay)}`}
            variant="secondary"
            aria-label={`View room: ${label}`}
            className="static! after:absolute after:inset-0 after:content-['']"
          >
            View room
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
