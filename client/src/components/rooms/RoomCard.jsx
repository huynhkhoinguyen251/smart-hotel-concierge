import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency.js';
import { toQueryString } from '../../utils/queryString.js';
import RatingStars from '../ui/RatingStars.jsx';
import RoomImage from './RoomImage.jsx';

// Thẻ phòng trong danh sách. stay: { check_in, check_out, guests } được gắn vào link chi tiết,
// để trang chi tiết điền sẵn ngày.
export default function RoomCard({ room, stay }) {
  const { room_type: roomType } = room;
  const guestLabel = roomType.capacity === 1 ? 'guest' : 'guests';

  return (
    <Link
      to={`/rooms/${room.id}${toQueryString(stay)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-teal-300 hover:shadow-md"
    >
      <RoomImage
        src={room.primary_image}
        alt={`${roomType.name}, room ${room.room_number}`}
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700">
          {roomType.name}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Room {room.room_number} · Floor {room.floor}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Up to {roomType.capacity} {guestLabel}
        </p>

        <div className="mt-3 text-sm">
          {room.review_count > 0 ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <RatingStars rating={room.avg_rating} />
              <span className="text-slate-500">
                ({room.review_count} {room.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </span>
          ) : (
            <span className="text-slate-500">No reviews yet</span>
          )}
        </div>

        <p className="mt-auto pt-4">
          <span className="text-lg font-bold text-teal-700">
            {formatCurrency(roomType.price_per_night)}
          </span>
          <span className="text-sm text-slate-500"> / night</span>
        </p>
      </div>
    </Link>
  );
}
