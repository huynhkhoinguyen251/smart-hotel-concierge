import { useSearchParams } from 'react-router-dom';
import { getServices } from '../api/services.api.js';
import { getTours } from '../api/tours.api.js';
import TourCard from '../components/tourism/TourCard.jsx';
import TransportServiceCard from '../components/tourism/TransportServiceCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { PageSpinner } from '../components/ui/Spinner.jsx';
import { isTransportCategory, TOURS_PAGE_TABS, TRANSPORT_CATEGORY_KEYS } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import { toQueryString } from '../utils/queryString.js';

// Tour và dịch vụ vận chuyển đều ít: tải một lần tối đa 50 (giới hạn của backend), không phân trang.
const LIST_LIMIT = 50;

// Tab "Local tours": tải mọi tour một lần, rồi lọc theo địa điểm ở trình duyệt.
// Các nút địa điểm được tạo từ chính danh sách tour, nên không có nút nào cho ra danh sách rỗng.
function LocalTours({ location }) {
  const list = useFetch(() => getTours({ limit: LIST_LIMIT }), []);

  if (list.loading) return <PageSpinner />;
  if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;

  const tours = list.data.tours;
  if (tours.length === 0) {
    return <EmptyState title="No tours available" message="Please check again later." />;
  }

  const locations = [...new Set(tours.map((tour) => tour.location))].sort();
  // Địa điểm lạ trên địa chỉ trang thì coi như "All locations".
  const active = locations.includes(location) ? location : '';
  const visible = active ? tours.filter((tour) => tour.location === active) : tours;
  const tabs = [
    { value: '', label: 'All locations' },
    ...locations.map((value) => ({ value, label: value })),
  ];

  return (
    <>
      <FilterTabs
        label="Filter by location"
        className="mb-6"
        tabs={tabs}
        active={active}
        getLink={(value) => `/tours${toQueryString({ location: value })}`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </>
  );
}

// Tab "Transport": một request GET /services (giống trang dịch vụ khách sạn), rồi giữ 3 loại vận chuyển.
// Một request thay vì ba, vì danh sách dịch vụ rất ngắn và trang Services cũng tải cùng cách này.
function TransportServices() {
  const list = useFetch(() => getServices({ limit: LIST_LIMIT }), []);

  if (list.loading) return <PageSpinner />;
  if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;

  const order = (service) => TRANSPORT_CATEGORY_KEYS.indexOf(service.category);
  const services = list.data.services
    .filter((service) => isTransportCategory(service.category))
    .sort((a, b) => order(a) - order(b) || a.id - b.id);

  if (services.length === 0) {
    return <EmptyState title="No transport services available" message="Please check again later." />;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <TransportServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

// /tours (công khai). ?tab=transport mở tab vận chuyển; ?location= lọc tour theo địa điểm.
export default function ToursPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'transport' ? 'transport' : '';
  const location = searchParams.get('location') ?? '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageTitle
        title="Tours and transport"
        subtitle="Explore Da Nang and nearby places, or book a ride with the hotel."
      />
      <FilterTabs
        label="Choose a section"
        className="mb-6"
        tabs={TOURS_PAGE_TABS}
        active={tab}
        getLink={(value) => `/tours${toQueryString({ tab: value })}`}
      />
      {tab === 'transport' ? <TransportServices /> : <LocalTours location={location} />}
    </div>
  );
}
