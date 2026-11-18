import { getReviewType } from '../../config/reviews.js';
import EmptyState from '../ui/EmptyState.jsx';
import RatingStars from '../ui/RatingStars.jsx';

const RATINGS_DESC = [5, 4, 3, 2, 1];

// Phân bố số sao (thanh ngang Tailwind, 5 sao ở trên) và điểm trung bình theo loại đơn.
export default function FeedbackSummary({ feedback }) {
  if (!feedback.review_count) {
    return <EmptyState title="No reviews yet" message="Guest reviews appear here after they are posted." />;
  }
  const max = Math.max(1, ...RATINGS_DESC.map((rating) => feedback.by_rating[rating] ?? 0));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <RatingStars rating={feedback.average_rating} size="md" />
          <span className="text-sm text-slate-500">
            from {feedback.review_count} {feedback.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <ul className="space-y-2" aria-label="Rating distribution">
          {RATINGS_DESC.map((rating) => {
            const count = feedback.by_rating[rating] ?? 0;
            return (
              <li key={rating} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="text-slate-700">
                  {rating}
                  <span aria-hidden="true"> ★</span>
                  <span className="sr-only"> stars</span>
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
                </span>
                <span className="text-right font-semibold text-slate-900">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Average by type</h3>
        <ul className="divide-y divide-slate-100 text-sm">
          {feedback.by_type.map((item) => (
            <li key={item.type} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="text-slate-700">{getReviewType(item.type)?.label ?? item.type}</span>
              {item.review_count > 0 ? (
                <span className="flex items-center gap-2">
                  <RatingStars rating={item.average_rating} />
                  <span className="text-xs text-slate-500">({item.review_count})</span>
                </span>
              ) : (
                <span className="text-slate-400">No reviews</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
