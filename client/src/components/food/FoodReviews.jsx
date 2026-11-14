import { useRef, useState } from 'react';
import { getFoodReviews } from '../../api/reviews.api.js';
import useFetch from '../../hooks/useFetch.js';
import formatDate from '../../utils/formatDate.js';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import Spinner from '../ui/Spinner.jsx';

const REVIEWS_PER_PAGE = 5;

// Mục chung "Food reviews" ở cuối trang thực đơn: điểm trung bình, số lượt và danh sách có phân trang.
// Trang đánh giá giữ trong state, không đưa lên địa chỉ trang để không lẫn với tab thực đơn.
export default function FoodReviews() {
  const [page, setPage] = useState(1);
  const sectionRef = useRef(null);
  const request = useFetch(() => getFoodReviews({ page, limit: REVIEWS_PER_PAGE }), [page]);
  // Trong lúc tải trang mới, useFetch vẫn giữ dữ liệu cũ, nên danh sách cũ hiện mờ thay vì nhấp nháy.
  const data = request.data;

  const goToPage = (nextPage) => {
    setPage(nextPage);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderBody = () => {
    if (request.error) {
      return <ErrorState title="Could not load reviews" message={request.error.message} onRetry={request.retry} />;
    }
    if (!data) {
      return (
        <div className="flex justify-center py-6 text-teal-700">
          <Spinner />
        </div>
      );
    }
    if (data.summary.review_count === 0) {
      return (
        <EmptyState
          title="No food reviews yet"
          message="Guests can review a food order after it is completed."
        />
      );
    }
    return (
      <>
        <ul className={`space-y-4 transition-opacity ${request.loading ? 'opacity-60' : ''}`}>
          {data.reviews.map((review) => (
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
        <Pagination
          className="mt-6"
          page={page}
          limit={REVIEWS_PER_PAGE}
          total={data.pagination?.total ?? data.summary.review_count}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <section ref={sectionRef} aria-labelledby="food-reviews-heading" className="mt-12 scroll-mt-24">
      <h2 id="food-reviews-heading" className="text-xl font-semibold text-slate-900">
        Food reviews
      </h2>
      {data && data.summary.review_count > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RatingStars rating={data.summary.average_rating} size="md" />
          <span className="text-sm text-slate-500">
            from {data.summary.review_count} {data.summary.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      )}
      <div className="mt-5">{renderBody()}</div>
    </section>
  );
}
