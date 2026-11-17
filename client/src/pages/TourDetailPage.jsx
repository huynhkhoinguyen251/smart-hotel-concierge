import { Link, useParams } from 'react-router-dom';
import { getTour, getTourReviews } from '../api/tours.api.js';
import ReviewSection from '../components/reviews/ReviewSection.jsx';
import RoomImage from '../components/rooms/RoomImage.jsx';
import GuestBookingGate from '../components/tourism/GuestBookingGate.jsx';
import TourBookingForm from '../components/tourism/TourBookingForm.jsx';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { ADMIN_TOUR_NOTE } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import formatCurrency from '../utils/formatCurrency.js';

// /tours/:id (công khai; form đặt cần đăng nhập).
export default function TourDetailPage() {
  const { id } = useParams();
  const request = useFetch(() => getTour(id), [id]);

  if (request.loading) return <PageSpinner />;
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
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  const tour = request.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/tours" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to tours
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
        {/* Không dùng Card vì ảnh tràn sát mép khung (Card có sẵn padding). */}
        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <RoomImage src={tour.image_url} alt={tour.name} className="aspect-[16/9] w-full" />
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {tour.location} · {tour.duration}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight break-words text-slate-900 sm:text-3xl">
              {tour.name}
            </h1>
            <p className="mt-3">
              <span className="text-2xl font-bold text-teal-700">{formatCurrency(tour.price)}</span>
              <span className="text-sm text-slate-500"> per person</span>
            </p>
            {tour.description && <p className="mt-4 text-slate-600">{tour.description}</p>}
          </div>
        </article>

        <Card className="lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Book this tour</h2>
          <GuestBookingGate
            adminNote={ADMIN_TOUR_NOTE}
            loginText="Log in with your guest account to book this tour. No room booking is needed."
          >
            <TourBookingForm tour={tour} />
          </GuestBookingGate>
        </Card>
      </div>

      <ReviewSection
        key={tour.id}
        title="Tour reviews"
        resourceKey={tour.id}
        loadPage={(params) => getTourReviews(tour.id, params)}
        emptyMessage="Guests can review a tour after it is completed."
      />
    </div>
  );
}
