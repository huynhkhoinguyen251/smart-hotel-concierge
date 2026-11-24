import { useSearchParams } from 'react-router-dom';
import { getServices } from '../api/services.api.js';
import ServiceCard from '../components/services/ServiceCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Bone, { BoneGroup } from '../components/ui/Bone.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { isHotelServiceCategory, SERVICE_CATEGORY_TABS } from '../config/services.js';
import useFetch from '../hooks/useFetch.js';
import { toQueryString } from '../utils/queryString.js';

// Khách sạn chỉ có vài dịch vụ, nên lấy một lần tối đa 50 (giới hạn của backend), không phân trang.
const SERVICES_LIMIT = 50;
const ID_PATTERN = /^[1-9]\d*$/;

const INFO_TEXT =
  'Hotel services are for guests with a confirmed or current stay. Laundry and housekeeping are available during your stay.';

// Mỗi hàng hai dịch vụ rộng hẹp khác nhau, hàng sau đảo lại. Dịch vụ lẻ cuối cùng chiếm cả hàng.
const GRID = 'grid gap-x-8 gap-y-14 md:grid-cols-12';
const isAlone = (index, count) => index === count - 1 && count % 2 === 1;
const getSpan = (index, count) => {
  if (isAlone(index, count)) return 'md:col-span-12';
  return [0, 3].includes(index % 4) ? 'md:col-span-7' : 'md:col-span-5';
};

function ServicesSkeleton() {
  return (
    <BoneGroup className={GRID}>
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className={getSpan(index, 4)}>
          <Bone className="aspect-[4/3] sm:aspect-auto sm:h-72 lg:h-80" />
          <Bone className="mt-5 h-7 w-56 max-w-full" />
          <Bone className="mt-3 h-5 w-full max-w-sm" />
        </div>
      ))}
    </BoneGroup>
  );
}

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
    if (list.loading) return <ServicesSkeleton />;
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
      <div className={GRID}>
        {services.map((service, index) => (
          <div key={service.id} className={getSpan(index, services.length)}>
            <ServiceCard
              service={service}
              to={`/services/${service.id}${toQueryString({ booking_id: bookingId })}`}
              wide={isAlone(index, services.length)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="shell pt-8 pb-16 lg:pt-12 lg:pb-24">
      <PageTitle title="Hotel services" subtitle={`Make your stay more comfortable. ${INFO_TEXT}`} />

      {bookingId && (
        <Alert type="info" className="mb-6">
          Choose a service for your booking #{bookingId}.
        </Alert>
      )}

      <FilterTabs
        label="Filter by category"
        className="mb-8"
        tabs={SERVICE_CATEGORY_TABS}
        active={category}
        getLink={(value) => `/services${toQueryString({ category: value, booking_id: bookingId })}`}
      />

      {renderList()}
    </div>
  );
}
