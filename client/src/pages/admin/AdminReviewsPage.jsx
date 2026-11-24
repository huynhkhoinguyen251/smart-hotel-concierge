import { getAdminReviews } from '../../api/adminReviews.api.js';
import { getFeedbackStats } from '../../api/adminStats.api.js';
import { CellLink, EmptyCell, GuestCell, TitleCell } from '../../components/admin/AdminCells.jsx';
import AdminListPanel, { AdminListBody } from '../../components/admin/AdminListPanel.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminRequestTable from '../../components/admin/AdminRequestTable.jsx';
import FilterTabs from '../../components/ui/FilterTabs.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import Select from '../../components/ui/Select.jsx';
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

// Dòng tóm tắt từ GET /admin/stats/feedback (cùng API với Dashboard). Lỗi thì không hiện gì,
// vì danh sách bên dưới vẫn dùng được.
function FeedbackLine() {
  const stats = useFetch(() => getFeedbackStats(), ['feedback-summary']);
  if (!stats.data) return null;
  const { average_rating: average, review_count: count } = stats.data;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
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
    </div>
  );
}

// Cột đầu dẫn tới đơn được đánh giá. Đánh giá 1-2 sao có nhãn "Low rating" để lễ tân liên hệ lại.
const COLUMNS = [
  {
    key: 'target',
    header: 'Reviewed item',
    render: ({ target }) => {
      const type = getReviewType(target?.type);
      const name = target?.name || (target?.id ? `#${target.id}` : '-');
      return (
        <TitleCell
          title={type && target?.id ? <CellLink to={type.adminPath(target.id)}>{name}</CellLink> : name}
          detail={type?.label ?? 'Reviewed item'}
        />
      );
    },
  },
  {
    key: 'rating',
    header: 'Rating',
    badges: true,
    render: (review) => (
      <span className="inline-flex items-center gap-2">
        <RatingStars rating={review.rating} showValue={false} />
        {review.rating <= LOW_RATING_MAX && (
          <span className="rounded-sm bg-warning-tint px-2 py-0.5 text-xs font-semibold text-warning-deep">
            Low rating
          </span>
        )}
      </span>
    ),
  },
  {
    key: 'comment',
    header: 'Comment',
    wide: true,
    free: true,
    render: (review) =>
      review.comment ? (
        <p className="whitespace-pre-line wrap-anywhere text-ink lg:w-80">{review.comment}</p>
      ) : (
        <EmptyCell>No comment</EmptyCell>
      ),
  },
  {
    key: 'guest',
    header: 'Guest',
    wide: true,
    render: ({ reviewer }) => (
      <GuestCell user={reviewer} to={reviewer?.id ? `/admin/users/${reviewer.id}` : undefined} />
    ),
  },
  {
    key: 'date',
    header: 'Posted',
    render: (review) => (
      <span className="whitespace-nowrap">{formatDate(review.created_at, { withTime: true })}</span>
    ),
  },
];

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

  const filtered = rating || type;

  return (
    <>
      <AdminPageHeader title="Reviews" subtitle={`Guest reviews, newest first. ${ADMIN_REVIEWS_NOTE}`} />
      <FeedbackLine />
      <AdminListPanel
        tabs={
          <FilterTabs
            label="Filter by rating"
            tabs={REVIEW_RATING_TABS}
            active={rating}
            getLink={(value) => `/admin/reviews${toQueryString({ type, rating: value })}`}
          />
        }
        toolbar={
          <Select
            label="Type"
            className="sm:w-56"
            value={type}
            onChange={(event) => updateUrl({ type: event.target.value, page: '' })}
            options={REVIEW_TYPE_OPTIONS}
          />
        }
      >
        <AdminListBody
          list={list}
          items={list.data?.items ?? []}
          empty={{
            title: filtered ? 'No reviews match these filters' : 'No reviews yet',
            message: filtered ? 'Try another rating or type.' : 'Guest reviews appear here after they are posted.',
          }}
          pagination={{
            page,
            limit: ADMIN_REVIEWS_PAGE_SIZE,
            total: list.data?.pagination?.total ?? 0,
            onPageChange: goToPage,
          }}
        >
          <AdminRequestTable caption="Reviews" items={list.data?.items ?? []} columns={COLUMNS} />
        </AdminListBody>
      </AdminListPanel>
    </>
  );
}
