import { useParams } from 'react-router-dom';
import { getServiceReviews } from '../api/reviews.api.js';
import { getService } from '../api/services.api.js';
import OfferLayout, { OfferSkeleton } from '../components/layout/OfferLayout.jsx';
import ReviewSection from '../components/reviews/ReviewSection.jsx';
import GuestBookingGate from '../components/tourism/GuestBookingGate.jsx';
import TransportBookingForm from '../components/tourism/TransportBookingForm.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { ADMIN_TRANSPORT_NOTE } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import { getTransportCategory } from '../utils/tourismHelpers.js';

function TransportNotFound() {
  return (
    <NotFoundView
      title="Transport service not found"
      message="This transport service does not exist or is no longer available."
      to="/tours?tab=transport"
      linkLabel="Back to transport"
    />
  );
}

// /transport/:id (công khai; form đặt cần đăng nhập). Chỉ nhận 3 loại vận chuyển.
export default function TransportDetailPage() {
  const { id } = useParams();
  const request = useFetch(() => getService(id), [id]);

  if (request.loading) return <OfferSkeleton />;
  if (request.error) {
    if ([400, 404].includes(request.error.status)) return <TransportNotFound />;
    return (
      <div className="shell py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  const service = request.data;
  const category = getTransportCategory(service.category);
  // Dịch vụ khách sạn (ví dụ massage) được đặt ở trang Services, không ở đây.
  if (!category) return <TransportNotFound />;

  return (
    <OfferLayout
      backTo="/tours?tab=transport"
      backLabel="Back to transport"
      image={service.image_url}
      title={service.name}
      meta={category.label}
      price={service.price}
      unit={category.priceUnit}
      description={service.description}
      note={`${category.pricing} No room booking is needed.`}
      panelTitle="Book this transport"
      panel={
        <GuestBookingGate
          adminNote={ADMIN_TRANSPORT_NOTE}
          loginText="Log in with your guest account to book this transport."
        >
          <TransportBookingForm key={service.id} service={service} />
        </GuestBookingGate>
      }
      reviews={
        <ReviewSection
          key={service.id}
          title="Reviews"
          resourceKey={service.id}
          loadPage={(params) => getServiceReviews(service.id, params)}
          emptyMessage="Guests can review a transport service after their request is completed."
          className=""
        />
      }
    />
  );
}
