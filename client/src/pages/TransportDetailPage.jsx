import { Link, useParams } from 'react-router-dom';
import { getService } from '../api/services.api.js';
import RoomImage from '../components/rooms/RoomImage.jsx';
import GuestBookingGate from '../components/tourism/GuestBookingGate.jsx';
import TransportBookingForm from '../components/tourism/TransportBookingForm.jsx';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import NotFoundView from '../components/ui/NotFoundView.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { ADMIN_TRANSPORT_NOTE } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import formatCurrency from '../utils/formatCurrency.js';
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

  if (request.loading) return <PageSpinner />;
  if (request.error) {
    if ([400, 404].includes(request.error.status)) return <TransportNotFound />;
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState message={request.error.message} onRetry={request.retry} />
      </div>
    );
  }

  const service = request.data;
  const category = getTransportCategory(service.category);
  // Dịch vụ khách sạn (ví dụ massage) được đặt ở trang Services, không ở đây.
  if (!category) return <TransportNotFound />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/tours?tab=transport" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← Back to transport
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <RoomImage src={service.image_url} alt={service.name} className="aspect-[16/9] w-full" />
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{category.label}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight break-words text-slate-900 sm:text-3xl">
              {service.name}
            </h1>
            <p className="mt-3">
              <span className="text-2xl font-bold text-teal-700">{formatCurrency(service.price)}</span>
              <span className="text-sm text-slate-500"> {category.priceUnit}</span>
            </p>
            {service.description && <p className="mt-4 text-slate-600">{service.description}</p>}
            <p className="mt-4 text-sm text-slate-500">
              {category.pricing} No room booking is needed.
            </p>
          </div>
        </article>

        <Card className="lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Book this transport</h2>
          <GuestBookingGate
            adminNote={ADMIN_TRANSPORT_NOTE}
            loginText="Log in with your guest account to book this transport."
          >
            <TransportBookingForm key={service.id} service={service} />
          </GuestBookingGate>
        </Card>
      </div>
    </div>
  );
}
