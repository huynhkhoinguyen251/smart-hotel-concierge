import RatingStars from '../ui/RatingStars.jsx';

// Điểm và số lượt đánh giá của một phòng. long = true: "(12 reviews)", ngược lại "(12)".
export default function RoomRating({ room, long = false }) {
  if (room.review_count === 0) {
    return <span className="text-sm text-ink-soft">No reviews yet</span>;
  }
  const word = room.review_count === 1 ? 'review' : 'reviews';
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <RatingStars rating={room.avg_rating} />
      <span className="text-sm text-ink-soft">
        ({room.review_count}
        {long ? ` ${word}` : <span className="sr-only"> {word}</span>})
      </span>
    </span>
  );
}
