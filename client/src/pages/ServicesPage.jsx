import { useSearchParams } from 'react-router-dom';
import { getServices } from '../api/services.api.js';
import ServiceCard from '../components/services/ServiceCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { isHotelServiceCategory, SERVICE_CATEGORY_TABS } from '../config/services.js';
import useFetch from '../hooks/useFetch.js';
import { toQueryString } from '../utils/queryString.js';

// Khách sạn chỉ có vài dịch vụ, nên lấy một lần tối đa 50 (giới hạn của backend), không phân trang.
const SERVICES_LIMIT = 50;
const ID_PATTERN = /^[1-9]\d*$/;

const INFO_TEXT =
  'Hotel services are for guests with a confirmed or current stay. Laundry and housekeeping are available during your stay.';

// /services?category=massage&booking_id=12 (công khai). booking_id đến từ trang chi tiết đơn
// đặt phòng và được chuyển tiếp sang trang đặt dịch vụ để chọn sẵn đơn đó.
export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const rawCategory = searchParams.get('category') ?? '';
  // Loại lạ (hoặc loại vận chuyển) trên địa chỉ trang thì coi như "All".
  const category = isHotelServiceCategory(rawCategory) ? rawCategory : '';
  const rawBookingId = searchParams.get('booking_id') ?? '';
  const bookingId = ID_PATTERN.test(rawBookingId) ? rawBookingId : '';

  const list = useFetch(() => getServices({ category, limit: SERVICES_LIMIT }), [category]);

  const renderList = () => {
    if (list.loading) return <PageSpinner />;
    if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;

    // API trả cả dịch vụ vận chuyển; trang này chỉ hiện 5 loại dịch vụ khách sạn.
    const services = list.data.services.filter((service) => isHotelServiceCategory(service.category));
    if (services.length === 0) {
      return (
        <EmptyState
          title="No services available"
          message="There are no services in this category right now. Please check again later."
        />
      );
    }
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            to={`/services/${service.id}${toQueryString({ booking_id: bookingId })}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageTitle title="Hotel services" subtitle="Make your stay more comfortable." />

      <div className="mb-6 space-y-3">
        <Alert type="info">{INFO_TEXT}</Alert>
        {bookingId && (
          <Alert type="info">Choose a service for your booking #{bookingId}.</Alert>
        )}
      </div>

      <FilterTabs
        label="Filter by category"
        className="mb-6"
        tabs={SERVICE_CATEGORY_TABS}
        active={category}
        getLink={(value) => `/services${toQueryString({ category: value, booking_id: bookingId })}`}
      />

      {renderList()}
    </div>
  );
}
