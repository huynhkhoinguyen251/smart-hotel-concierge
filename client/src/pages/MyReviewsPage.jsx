import { Link } from 'react-router-dom';
import { getMyReviews } from '../api/reviews.api.js';
import AccountListPage from '../components/layout/AccountListPage.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import RatingStars from '../components/ui/RatingStars.jsx';
import { getReviewType } from '../config/reviews.js';
import useFetch from '../hooks/useFetch.js';
import useUrlFilters from '../hooks/useUrlFilters.js';
import formatDate from '../utils/formatDate.js';

const PAGE_SIZE = 10;

function MyReviewRow({ review }) {
  const { target } = review;
  const type = getReviewType(target.type);

  return (
    <li className="p-4 lg:px-5 lg:py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="min-w-0 text-lg font-semibold wrap-anywhere text-ink">
          {type ? (
            <Link to={type.detailPath(target.id)} className="text-sea hover:text-sea-hover hover:underline">
              {target.name}
            </Link>
          ) : (
            target.name
          )}
        </h2>
        <p className="text-sm text-ink-soft">
          {type?.label ?? target.type} · {formatDate(review.created_at)}
        </p>
      </div>
      <RatingStars rating={review.rating} className="mt-2" />
      {review.comment && (
        <p className="mt-2 max-w-prose whitespace-pre-line wrap-anywhere text-ink">{review.comment}</p>
      )}
    </li>
  );
}

// /my-reviews: đánh giá của tôi, mới nhất trước. Trang hiện tại nằm trên địa chỉ trang.
export default function MyReviewsPage() {
  const { page, goToPage } = useUrlFilters({});
  const list = useFetch(() => getMyReviews({ page, limit: PAGE_SIZE }), [page]);

  return (
    <AccountListPage
      title="My reviews"
      subtitle="Reviews you have written, newest first. Reviews cannot be changed."
      list={list}
      items={list.data?.reviews}
      empty={{
        title: 'No reviews yet',
        message:
          'You can write a review after a stay is checked out, or after a service, food order, tour or transport request is completed. Open it from your bookings or orders.',
        action: <ButtonLink to="/my-bookings">My bookings</ButtonLink>,
      }}
      pagination={{ page, limit: PAGE_SIZE, total: list.data?.pagination?.total ?? 0, onPageChange: goToPage }}
      listLabel="Reviews"
      renderItem={(review) => <MyReviewRow key={review.id} review={review} />}
    />
  );
}
