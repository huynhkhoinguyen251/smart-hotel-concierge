import { useId, useRef, useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import Spinner from '../ui/Spinner.jsx';
import ReviewItem from './ReviewItem.jsx';

const DEFAULT_PAGE_SIZE = 5;

// Mục đánh giá công khai dùng chung: điểm trung bình, số lượt, danh sách và phân trang.
// loadPage({ page, limit }) trả { summary, reviews, pagination } (dạng chung của các API đánh giá công khai).
// resourceKey: id của tour, phòng...; trang cha nên gắn key theo id để đổi mục thì về trang 1.
// Trang đánh giá giữ trong state, không đưa lên địa chỉ trang để không lẫn với bộ lọc của trang.
export default function ReviewSection({
  title,
  loadPage,
  resourceKey = '',
  emptyTitle = 'No reviews yet',
  emptyMessage,
  pageSize = DEFAULT_PAGE_SIZE,
  className = 'mt-12',
}) {
  const headingId = useId();
  const reducedMotion = useReducedMotion();
  const [page, setPage] = useState(1);
  const sectionRef = useRef(null);
  const request = useFetch(() => loadPage({ page, limit: pageSize }), [resourceKey, page]);
  // Trong lúc tải trang mới, useFetch vẫn giữ dữ liệu cũ, nên danh sách cũ hiện mờ thay vì nhấp nháy.
  const data = request.data;

  const goToPage = (nextPage) => {
    setPage(nextPage);
    sectionRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const renderBody = () => {
    if (request.error) {
      return <ErrorState title="Could not load reviews" message={request.error.message} onRetry={request.retry} />;
    }
    if (!data) {
      return (
        <div className="flex py-6 text-sea">
          <Spinner />
        </div>
      );
    }
    if (data.summary.review_count === 0) {
      return <EmptyState title={emptyTitle} message={emptyMessage} />;
    }
    return (
      <>
        <ul className={`divide-y divide-line-soft border-y border-line-soft transition-opacity ${request.loading ? 'opacity-60' : ''}`}>
          {data.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
        <Pagination
          className="mt-6"
          page={page}
          limit={pageSize}
          total={data.pagination?.total ?? data.summary.review_count}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <section ref={sectionRef} aria-labelledby={headingId} className={`max-w-3xl scroll-mt-24 ${className}`}>
      <h2 id={headingId} className="text-xl font-semibold text-ink">
        {title}
      </h2>
      {data && data.summary.review_count > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RatingStars rating={data.summary.average_rating} size="md" />
          <span className="text-sm text-ink-soft">
            from {data.summary.review_count} {data.summary.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      )}
      <div className="mt-5">{renderBody()}</div>
    </section>
  );
}
