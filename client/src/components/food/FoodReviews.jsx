import { getFoodReviews } from '../../api/reviews.api.js';
import ReviewSection from '../reviews/ReviewSection.jsx';

// Mục chung "Food reviews" ở cuối trang thực đơn (đánh giá theo đơn, không theo từng món).
export default function FoodReviews() {
  return (
    <ReviewSection
      title="Food reviews"
      loadPage={getFoodReviews}
      emptyTitle="No food reviews yet"
      emptyMessage="Guests can review a food order after it is completed."
    />
  );
}
