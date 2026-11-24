import { getReviewType } from '../../config/reviews.js';
import EmptyState from '../ui/EmptyState.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import BarRow from './charts/BarRow.jsx';

const RATINGS_DESC = [5, 4, 3, 2, 1];

// Phân bố số sao (thanh ngang, 5 sao ở trên) và điểm trung bình theo loại đơn.
export default function FeedbackSummary({ feedback }) {
  if (!feedback.review_count) {
    return <EmptyState title="No reviews yet" message="Guest reviews appear here after they are posted." />;
  }
  const max = Math.max(1, ...RATINGS_DESC.map((rating) => feedback.by_rating[rating] ?? 0));

  return (
    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <RatingStars rating={feedback.average_rating} size="md" />
          <span className="text-sm text-ink-soft">
            from {feedback.review_count} {feedback.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <ul className="space-y-4" aria-label="Rating distribution">
          {RATINGS_DESC.map((rating) => {
            const count = feedback.by_rating[rating] ?? 0;
            return (
              <li key={rating}>
                <BarRow
                  label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                  share={count / max}
                  value={<span className="font-semibold">{count}</span>}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">Average by type</h3>
        <ul className="divide-y divide-line-soft text-sm">
          {feedback.by_type.map((item) => (
            <li key={item.type} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className="text-ink">{getReviewType(item.type)?.label ?? item.type}</span>
              {item.review_count > 0 ? (
                <span className="flex items-center gap-2">
                  <RatingStars rating={item.average_rating} />
                  <span className="text-xs text-ink-soft">({item.review_count})</span>
                </span>
              ) : (
                <span className="text-ink-soft">No reviews</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
