import { useState } from 'react';
import { createReview } from '../../api/reviews.api.js';
import {
  getReviewType,
  REVIEW_COMMENT_MAX_LENGTH,
  REVIEW_CREATED_MESSAGE,
  REVIEW_DUPLICATE_MESSAGE,
} from '../../config/reviews.js';
import useAuth from '../../hooks/useAuth.js';
import useMyReview from '../../hooks/useMyReview.js';
import formatDate from '../../utils/formatDate.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import Spinner from '../ui/Spinner.jsx';
import Textarea from '../ui/Textarea.jsx';
import StarRatingInput from './StarRatingInput.jsx';

// Đánh giá đã viết: chỉ xem, vì đánh giá không sửa và không xóa được.
function ReadOnlyReview({ review }) {
  return (
    <div>
      <RatingStars rating={review.rating} size="md" />
      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm wrap-anywhere text-slate-700">{review.comment}</p>
      )}
      <p className="mt-2 text-xs text-slate-500">Posted on {formatDate(review.created_at)}</p>
    </div>
  );
}

function ReviewForm({ config, itemId, onPosted, onDuplicate }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) {
      setRatingError('Choose a rating from 1 to 5 stars');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const review = await createReview({
        target: { [config.field]: Number(itemId) },
        rating,
        comment: comment.trim(),
      });
      onPosted(review);
    } catch (apiError) {
      setSubmitting(false);
      // 409: đã đánh giá rồi (ví dụ ở một tab khác) - tải lại để hiện đánh giá đó.
      if (apiError.status === 409) {
        onDuplicate();
        return;
      }
      setError(apiError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Rate your experience">
      <StarRatingInput
        value={rating}
        onChange={(value) => {
          setRating(value);
          setRatingError('');
        }}
        error={ratingError}
        disabled={submitting}
      />
      <Textarea
        label="Comment (optional)"
        name="comment"
        rows={3}
        maxLength={REVIEW_COMMENT_MAX_LENGTH}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="What did you like? What could be better?"
        disabled={submitting}
      />
      <div aria-live="polite">
        <Alert type="error">{error}</Alert>
      </div>
      <Button type="submit" fullWidth loading={submitting}>
        Submit review
      </Button>
      <p className="text-xs text-slate-500">Reviews cannot be changed after they are posted.</p>
    </form>
  );
}

// Phần chính, chỉ dựng khi đã chắc chắn được đánh giá (khách, đơn đã hoàn thành).
function ReviewPanelContent({ type, config, itemId }) {
  const request = useMyReview(type, itemId);
  const [posted, setPosted] = useState(null);
  const [notice, setNotice] = useState({ type: 'success', text: '' });

  const review = posted ?? request.data;

  const renderBody = () => {
    if (request.loading && !posted) {
      return (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Spinner size="sm" className="text-teal-700" /> Checking your review...
        </p>
      );
    }
    if (request.error && !posted) {
      return (
        <div className="space-y-3">
          <Alert type="error">{request.error.message}</Alert>
          <Button variant="secondary" onClick={request.retry}>
            Try again
          </Button>
        </div>
      );
    }
    if (review) return <ReadOnlyReview review={review} />;
    return (
      <ReviewForm
        config={config}
        itemId={itemId}
        onPosted={(created) => {
          setPosted(created);
          setNotice({ type: 'success', text: REVIEW_CREATED_MESSAGE });
        }}
        onDuplicate={() => {
          setNotice({ type: 'info', text: REVIEW_DUPLICATE_MESSAGE });
          request.retry();
        }}
      />
    );
  };

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">
        {review ? 'Your review' : 'Rate your experience'}
      </h2>
      <div aria-live="polite">
        <Alert type={notice.type} className="mb-3">
          {notice.text}
        </Alert>
      </div>
      {renderBody()}
    </Card>
  );
}

// Khung đánh giá ở trang chi tiết đơn của tôi. type: room | service | food_order | tour | transport.
// Không hiện gì khi: chưa đăng nhập, là admin, hoặc đơn chưa hoàn thành (status khác doneStatus).
export default function ReviewPanel({ type, itemId, status }) {
  const { user, isAdmin } = useAuth();
  const config = getReviewType(type);

  if (!config || !user || isAdmin || status !== config.doneStatus) return null;
  return <ReviewPanelContent key={`${type}-${itemId}`} type={type} config={config} itemId={itemId} />;
}
