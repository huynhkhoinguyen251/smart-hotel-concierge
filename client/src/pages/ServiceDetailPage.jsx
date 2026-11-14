import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { getService } from '../api/services.api.js';
import RoomImage from '../components/rooms/RoomImage.jsx';
import ServiceRequestForm from '../components/services/ServiceRequestForm.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import Spinner, { PageSpinner } from '../components/ui/Spinner.jsx';
import { ADMIN_SERVICE_NOTE } from '../config/services.js';
import { getStatusConfig } from '../config/statuses.js';
import useAuth from '../hooks/useAuth.js';
import useFetch from '../hooks/useFetch.js';
import formatCurrency from '../utils/formatCurrency.js';
import { toQueryString } from '../utils/queryString.js';
import { getCategoryLabel, getPriceUnit, getServiceCategory } from '../utils/serviceHelpers.js';

const ID_PATTERN = /^[1-9]\d*$/;

// Phần bên phải: form đặt, nút đăng nhập, hoặc ghi chú cho admin.
function BookingPanel({ service, bookingId }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const category = getServiceCategory(service.category);

  if (!category) {
    // Dịch vụ vận chuyển đặt ở trang Tours.
    return (
      <div className="space-y-4">
        <Alert type="info">This service is booked from the Tours page.</Alert>
        <Link to="/tours" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
          Go to Tours →
        </Link>
      </div>
    );
  }
  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner size="sm" className="text-teal-700" /> Loading...
      </p>
    );
  }
  if (!user) {
    // Đăng nhập xong quay lại đúng trang này (kể cả ?booking_id=).
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Log in with your guest account to book this service.</p>
        <Link
          to="/login"
          state={{ from: location }}
          className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Log in to book
        </Link>
      </div>
    );
  }
  if (isAdmin) {
    return <p className="text-sm text-slate-500">{ADMIN_SERVICE_NOTE}</p>;
  }
  return <ServiceRequestForm service={service} initialBookingId={bookingId} />;
}

// /services/:id (công khai; form đặt cần đăng nhập). ?booking_id= chọn sẵn đơn đặt phòng.
export default function ServiceDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rawBookingId = searchParams.get('booking_id') ?? '';
  const bookingId = ID_PATTERN.test(rawBookingId) ? rawBookingId : '';

  const request = useFetch(() => getService(id), [id]);

  if (request.loading) return <PageSpinner />;
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
      <div className="mx-auto max-w-5xl px-4 py-10">
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to={`/services${toQueryString({ booking_id: bookingId })}`}
        className="text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        ← Back to services
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
        {/* Không dùng Card vì ảnh tràn sát mép khung (Card có sẵn padding). */}
        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <RoomImage src={service.image_url} alt={service.name} className="aspect-[16/9] w-full" />
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {getCategoryLabel(service.category)}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {service.name}
            </h1>
            <p className="mt-3">
              <span className="text-2xl font-bold text-teal-700">{formatCurrency(service.price)}</span>
              <span className="text-sm text-slate-500"> {getPriceUnit(service.category)}</span>
            </p>
            {service.description && <p className="mt-4 text-slate-600">{service.description}</p>}
            {requiredStatuses && (
              <p className="mt-4 text-sm text-slate-500">
                Requires a {requiredStatuses} room booking. The time must be within your stay.
              </p>
            )}
          </div>
        </article>

        <Card className="lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Book this service</h2>
          <BookingPanel service={service} bookingId={bookingId} />
        </Card>
      </div>
    </div>
  );
}
