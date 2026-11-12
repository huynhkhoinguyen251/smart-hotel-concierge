import { useEffect, useState } from 'react';
import { getRoomReviews } from '../../api/rooms.api.js';
import formatDate from '../../utils/formatDate.js';
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
    <section aria-labelledby="reviews-heading" className="mt-10">
      <h2 id="reviews-heading" className="text-xl font-semibold text-slate-900">
        Guest reviews
      </h2>

      {summary && summary.review_count > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RatingStars rating={summary.average_rating} size="md" />
          <span className="text-sm text-slate-500">
            from {summary.review_count} {summary.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      )}

      {summary && summary.review_count === 0 && (
        <p className="mt-3 text-sm text-slate-500">No reviews yet</p>
      )}

      {reviews.length > 0 && (
        <ul className="mt-5 space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{review.reviewer.full_name}</p>
                <p className="text-sm text-slate-500">{formatDate(review.created_at)}</p>
              </div>
              <RatingStars rating={review.rating} showValue={false} className="mt-1.5" />
              {review.comment && (
                <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-700">
                  {review.comment}
                </p>
              )}
            </li>
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
        <div className="mt-5 flex justify-center text-teal-700">
          <Spinner />
        </div>
      )}

      {hasMore && !error && (
        <div className="mt-5 text-center">
          <Button variant="secondary" loading={loading} onClick={() => loadPage(page + 1)}>
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
