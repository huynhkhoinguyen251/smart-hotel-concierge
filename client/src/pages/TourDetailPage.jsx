import { useParams } from 'react-router-dom';
import { getTour, getTourReviews } from '../api/tours.api.js';
import OfferLayout, { OfferSkeleton } from '../components/layout/OfferLayout.jsx';
import ReviewSection from '../components/reviews/ReviewSection.jsx';
import GuestBookingGate from '../components/tourism/GuestBookingGate.jsx';
import TourBookingForm from '../components/tourism/TourBookingForm.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { ADMIN_TOUR_NOTE } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';

// /tours/:id (công khai; form đặt cần đăng nhập).
export default function TourDetailPage() {
  const { id } = useParams();
  const request = useFetch(() => getTour(id), [id]);

  if (request.loading) return <OfferSkeleton />;
  if (request.error) {
    if ([400, 404].includes(request.error.status)) {
      return (
        <NotFoundView
          title="Tour not found"
          message="This tour does not exist or is no longer available."
          to="/tours"
          linkLabel="Back to tours"
        />
      );
    }
    return (
      <div className="shell py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  const tour = request.data;

  return (
    <OfferLayout
      backTo="/tours"
      backLabel="Back to tours"
      image={tour.image_url}
      title={tour.name}
      meta={`${tour.location} · ${tour.duration}`}
      price={tour.price}
      unit="per person"
      description={tour.description}
      panelTitle="Book this tour"
      panel={
        <GuestBookingGate
          adminNote={ADMIN_TOUR_NOTE}
          loginText="Log in with your guest account to book this tour. No room booking is needed."
        >
          <TourBookingForm tour={tour} />
        </GuestBookingGate>
      }
      reviews={
        <ReviewSection
          key={tour.id}
          title="Tour reviews"
          resourceKey={tour.id}
          loadPage={(params) => getTourReviews(tour.id, params)}
          emptyMessage="Guests can review a tour after it is completed."
          className=""
        />
      }
    />
  );
}
