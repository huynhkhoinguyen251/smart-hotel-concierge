import { Link } from 'react-router-dom';
import { getAdminReviews } from '../../api/adminReviews.api.js';
import { getFeedbackStats } from '../../api/adminStats.api.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadError from '../../components/ui/LoadError.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import Select from '../../components/ui/Select.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
import {
  ADMIN_REVIEWS_NOTE,
  ADMIN_REVIEWS_PAGE_SIZE,
  getReviewType,
  LOW_RATING_MAX,
  REVIEW_RATING_TABS,
  REVIEW_TYPE_OPTIONS,
} from '../../config/reviews.js';
import useFetch from '../../hooks/useFetch.js';
import useUrlFilters from '../../hooks/useUrlFilters.js';
import formatDate from '../../utils/formatDate.js';
import { toQueryString } from '../../utils/queryString.js';

const LINK = 'font-medium text-teal-700 hover:text-teal-800';

// Dòng tóm tắt từ GET /admin/stats/feedback (cùng API với Dashboard). Lỗi thì không hiện gì,
// vì danh sách bên dưới vẫn dùng được.
function FeedbackLine() {
  const stats = useFetch(() => getFeedbackStats(), ['feedback-summary']);
  if (!stats.data) return null;
  const { average_rating: average, review_count: count } = stats.data;
  return (
    <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
      {count > 0 ? (
        <>
          <RatingStars rating={average} />
          <span>
            average from {count} {count === 1 ? 'review' : 'reviews'}
          </span>
        </>
      ) : (
        'No reviews yet.'
      )}
    </p>
  );
}

// Một đánh giá. Đánh giá 1-2 sao có viền trái màu hổ phách và nhãn "Low rating" để lễ tân liên hệ lại.
function ReviewCard({ review }) {
  const type = getReviewType(review.target?.type);
  const low = review.rating <= LOW_RATING_MAX;
  const { reviewer, target } = review;

  return (
    <li
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        low ? 'border-amber-200 border-l-4 border-l-amber-400 bg-amber-50/40' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <RatingStars rating={review.rating} showValue={false} />
          {low && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Low rating</span>
          )}
        </div>
        <span className="text-xs text-slate-500">{formatDate(review.created_at, { withTime: true })}</span>
      </div>

      {review.comment ? (
        <p className="mt-3 text-sm whitespace-pre-line wrap-anywhere text-slate-800">{review.comment}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-400 italic">No comment</p>
      )}

      <dl className="mt-3 grid gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs font-medium text-slate-500">{type?.label ?? 'Reviewed item'}</dt>
          <dd className="break-words">
            {type && target?.id ? (
              <Link to={type.adminPath(target.id)} className={LINK}>
                {target.name || `#${target.id}`}
              </Link>
            ) : (
              (target?.name ?? '-')
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-slate-500">Guest</dt>
          <dd className="break-words">
            {reviewer?.id ? (
              <Link to={`/admin/users/${reviewer.id}`} className={LINK}>
                {reviewer.full_name}
              </Link>
            ) : (
              (reviewer?.full_name ?? '-')
            )}
            {reviewer?.email && <span className="block text-xs break-all text-slate-500">{reviewer.email}</span>}
          </dd>
        </div>
      </dl>
    </li>
  );
}

// /admin/reviews: mọi đánh giá của khách, chỉ đọc. Số sao, loại và trang nằm trên địa chỉ trang.
export default function AdminReviewsPage() {
  // Giá trị lạ trên địa chỉ trang thì coi như "All".
  const { values, page, updateUrl, goToPage } = useUrlFilters({
    rating: REVIEW_RATING_TABS,
    type: REVIEW_TYPE_OPTIONS,
  });
  const { rating, type } = values;

  const list = useFetch(
    () => getAdminReviews({ rating, type, page, limit: ADMIN_REVIEWS_PAGE_SIZE }),
    ['admin-reviews', rating, type, page],
  );

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) {
      return <LoadError error={list.error} onRetry={list.retry} />;
    }
    if (list.data.items.length === 0) {
      const filtered = rating || type;
      return (
        <EmptyState
          title={filtered ? 'No reviews match these filters' : 'No reviews yet'}
          message={filtered ? 'Try another rating or type.' : 'Guest reviews appear here after they are posted.'}
        />
      );
    }
    return (
      <>
        <ul className="space-y-4" aria-label="Reviews">
          {list.data.items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
        <Pagination
          className="mt-8"
          page={page}
          limit={ADMIN_REVIEWS_PAGE_SIZE}
          total={list.data.pagination?.total ?? 0}
          onPageChange={goToPage}
        />
      </>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Reviews</h1>
      <p className="mt-1.5 text-slate-600">Guest reviews, newest first.</p>
      <p className="mt-1 mb-4 text-sm text-slate-500">{ADMIN_REVIEWS_NOTE}</p>
      <FeedbackLine />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterTabs
          label="Filter by rating"
          className="min-w-0 lg:mx-0 lg:px-0"
          tabs={REVIEW_RATING_TABS}
          active={rating}
          getLink={(value) => `/admin/reviews${toQueryString({ type, rating: value })}`}
        />
        <Select
          label="Type"
          className="sm:w-56"
          value={type}
          onChange={(event) => updateUrl({ type: event.target.value, page: '' })}
          options={REVIEW_TYPE_OPTIONS}
        />
      </div>
      {renderList()}
    </div>
  );
}
