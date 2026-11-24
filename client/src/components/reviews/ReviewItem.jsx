import formatDate from '../../utils/formatDate.js';
import RatingStars from '../ui/RatingStars.jsx';

// Một đánh giá công khai trong danh sách (các dòng ngăn nhau bằng đường kẻ).
export default function ReviewItem({ review }) {
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-semibold break-words text-ink">{review.reviewer.full_name}</p>
        <p className="text-sm text-ink-soft">{formatDate(review.created_at)}</p>
      </div>
      <RatingStars rating={review.rating} showValue={false} className="mt-1" />
      {review.comment && (
        <p className="mt-2 max-w-prose whitespace-pre-line break-words text-ink">{review.comment}</p>
      )}
    </li>
  );
}
