import { Link } from 'react-router-dom';
import { getMyReviews } from '../api/reviews.api.js';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import RatingStars from '../components/ui/RatingStars.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { getReviewType } from '../config/reviews.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import formatDate from '../utils/formatDate.js';

const PAGE_SIZE = 10;

function MyReviewCard({ review }) {
  const { target } = review;
  const type = getReviewType(target.type);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {type?.label ?? target.type}
          </p>
          {type ? (
            <Link
              to={type.detailPath(target.id)}
              className="mt-0.5 block font-semibold wrap-anywhere text-slate-900 hover:text-teal-700"
            >
              {target.name}
            </Link>
          ) : (
            <p className="mt-0.5 font-semibold wrap-anywhere text-slate-900">{target.name}</p>
          )}
        </div>
        <p className="text-sm text-slate-500">{formatDate(review.created_at)}</p>
      </div>
      <RatingStars rating={review.rating} className="mt-2" />
      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm wrap-anywhere text-slate-700">{review.comment}</p>
      )}
    </article>
  );
}

// /my-reviews: đánh giá của tôi, mới nhất trước. Trang hiện tại nằm trên địa chỉ trang.
export default function MyReviewsPage() {
  const { page, goToPage } = useUrlFilters({});
  const list = useFetch(() => getMyReviews({ page, limit: PAGE_SIZE }), [page]);

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;
    if (list.data.reviews.length === 0) {
      return (
        <EmptyState
          title="No reviews yet"
          message="You can write a review after a stay is checked out, or after a service, food order, tour or transport request is completed. Open it from your bookings or orders."
          action={
            <Link
              to="/my-bookings"
              className="inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              My bookings
            </Link>
          }
        />
      );
    }
    return (
      <>
        <div className="space-y-4">
          {list.data.reviews.map((review) => (
            <MyReviewCard key={review.id} review={review} />
          ))}
        </div>
        <Pagination
          className="mt-8"
          page={page}
          limit={PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageTitle title="My reviews" subtitle="Reviews you have written, newest first. Reviews cannot be changed." />
      {renderList()}
    </div>
  );
}
