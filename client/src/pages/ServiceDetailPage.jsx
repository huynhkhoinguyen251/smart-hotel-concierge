import { useParams, useSearchParams } from 'react-router-dom';
import { getServiceReviews } from '../api/reviews.api.js';
import { getService } from '../api/services.api.js';
import OfferLayout, { OfferSkeleton } from '../components/layout/OfferLayout.jsx';
import ReviewSection from '../components/reviews/ReviewSection.jsx';
import ServiceRequestForm from '../components/services/ServiceRequestForm.jsx';
import GuestBookingGate from '../components/tourism/GuestBookingGate.jsx';
import Alert from '../components/ui/Alert.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import MoreLink from '../components/ui/MoreLink.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { ADMIN_SERVICE_NOTE } from '../config/services.js';
import { getStatusConfig } from '../config/statuses.js';
import useFetch from '../hooks/useFetch.js';
import { toQueryString } from '../utils/queryString.js';
import { getCategoryLabel, getPriceUnit, getServiceCategory } from '../utils/serviceHelpers.js';

const ID_PATTERN = /^[1-9]\d*$/;

// Khung bên phải: form đặt, nút đăng nhập, hoặc ghi chú cho admin.
function BookingPanel({ service, bookingId }) {
  if (!getServiceCategory(service.category)) {
    // Dịch vụ vận chuyển có trang đặt riêng (/transport/:id), thuộc mục Tours.
    return (
      <div className="space-y-4">
        <Alert type="info">This service is booked from the Tours page.</Alert>
        <MoreLink to={`/transport/${service.id}`}>Book this transport</MoreLink>
      </div>
    );
  }
  // Đăng nhập xong quay lại đúng trang này (kể cả ?booking_id=).
  return (
    <GuestBookingGate
      adminNote={ADMIN_SERVICE_NOTE}
      loginText="Log in with your guest account to book this service."
    >
      <ServiceRequestForm service={service} initialBookingId={bookingId} />
    </GuestBookingGate>
  );
}

// /services/:id (công khai; form đặt cần đăng nhập). ?booking_id= chọn sẵn đơn đặt phòng.
export default function ServiceDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rawBookingId = searchParams.get('booking_id') ?? '';
  const bookingId = ID_PATTERN.test(rawBookingId) ? rawBookingId : '';

  const request = useFetch(() => getService(id), [id]);

  if (request.loading) return <OfferSkeleton />;
  if (request.error) {
    if ([400, 404].includes(request.error.status)) {
      return (
        <NotFoundView
          title="Service not found"
          message="This service does not exist or is no longer available."
          to="/services"
          linkLabel="Back to services"
        />
      );
    }
    return (
      <div className="shell py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  const service = request.data;
  const category = getServiceCategory(service.category);
  const requiredStatuses = category?.bookingStatuses
    .map((status) => getStatusConfig(status).label.toLowerCase())
    .join(' or ');

  return (
    <OfferLayout
      backTo={`/services${toQueryString({ booking_id: bookingId })}`}
      backLabel="Back to services"
      image={service.image_url}
      title={service.name}
      meta={getCategoryLabel(service.category)}
      price={service.price}
      unit={getPriceUnit(service.category)}
      description={service.description}
      note={
        requiredStatuses &&
        `Requires a ${requiredStatuses} room booking. The time must be within your stay.`
      }
      panelTitle="Book this service"
      panel={<BookingPanel service={service} bookingId={bookingId} />}
      reviews={
        <ReviewSection
          key={service.id}
          title="Service reviews"
          resourceKey={service.id}
          loadPage={(params) => getServiceReviews(service.id, params)}
          emptyMessage="Guests can review a service after their request is completed."
          className=""
        />
      }
    />
  );
}
