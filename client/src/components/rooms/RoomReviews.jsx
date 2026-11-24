import { useEffect, useState } from 'react';
import { getRoomReviews } from '../../api/rooms.api.js';
import ReviewItem from '../reviews/ReviewItem.jsx';
import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import Spinner from '../ui/Spinner.jsx';

const REVIEWS_PER_PAGE = 5;

// Đánh giá của một phòng: điểm trung bình, số lượt và danh sách, mỗi lần tải thêm 5 đánh giá.
// Trang cha gắn key theo id phòng, nên đổi phòng thì component được tạo lại từ đầu.
export default function RoomReviews({ roomId }) {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPage = (pageNumber) =>
    getRoomReviews(roomId, { page: pageNumber, limit: REVIEWS_PER_PAGE });

  // Trang 1 thay danh sách, các trang sau nối thêm vào cuối.
  const applyPage = (pageNumber, data) => {
    setSummary(data.summary);
    setReviews((current) => (pageNumber === 1 ? data.reviews : [...current, ...data.reviews]));
    setTotal(data.pagination?.total ?? data.summary.review_count);
    setPage(pageNumber);
  };

  // Bấm "Load more" hoặc "Try again".
  const loadPage = async (pageNumber) => {
    setLoading(true);
    setError('');
    try {
      applyPage(pageNumber, await fetchPage(pageNumber));
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải trang đầu khi component được tạo (loading đã là true từ đầu).
  useEffect(() => {
    let active = true;
    fetchPage(1)
      .then((data) => active && applyPage(1, data))
      .catch((apiError) => active && setError(apiError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasMore = reviews.length < total;

  return (
    <section aria-labelledby="reviews-heading" className="max-w-3xl">
      <h2 id="reviews-heading" className="text-xl font-semibold text-ink">
        Guest reviews
      </h2>

      {summary && summary.review_count > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RatingStars rating={summary.average_rating} size="md" />
          <span className="text-sm text-ink-soft">
            from {summary.review_count} {summary.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      )}

      {summary && summary.review_count === 0 && (
        <p className="mt-3 text-sm text-ink-soft">No reviews yet</p>
      )}

      {reviews.length > 0 && (
        <ul className="mt-5 divide-y divide-line-soft border-y border-line-soft">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      )}

      {error && (
        <ErrorState
          className="mt-5"
          title="Could not load reviews"
          message={error}
          onRetry={() => loadPage(page + 1)}
        />
      )}

      {loading && reviews.length === 0 && !error && (
        <div className="mt-5 text-sea">
          <Spinner />
        </div>
      )}

      {hasMore && !error && (
        <div className="mt-5">
          <Button variant="secondary" loading={loading} onClick={() => loadPage(page + 1)}>
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
