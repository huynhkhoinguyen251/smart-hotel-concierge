import { useSearchParams } from 'react-router-dom';
import { getServices } from '../api/services.api.js';
import { getTours } from '../api/tours.api.js';
import TourCard from '../components/tourism/TourCard.jsx';
import TransportServiceCard from '../components/tourism/TransportServiceCard.jsx';
import Bone, { BoneGroup } from '../components/ui/Bone.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import FilterTabs from '../components/ui/FilterTabs.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
import { isTransportCategory, TOURS_PAGE_TABS, TRANSPORT_CATEGORY_KEYS } from '../config/tourism.js';
import useFetch from '../hooks/useFetch.js';
import { toQueryString } from '../utils/queryString.js';

// Tour và dịch vụ vận chuyển đều ít: tải một lần tối đa 50 (giới hạn của backend), không phân trang.
const LIST_LIMIT = 50;

// Bố cục tour: tour đầu là ảnh rộng hết cột, các tour sau nhỏ hơn và không rộng bằng nhau.
// Chỉ còn một hoặc hai tour thì tour nào cũng rộng.
const SMALL_GRIDS = {
  2: 'sm:grid-cols-[1fr_1.4fr]',
  3: 'sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr] sm:max-lg:[&>*:last-child]:col-span-2',
};
const FALLBACK_GRID = 'sm:grid-cols-2 lg:grid-cols-3';
const TRANSPORT_LIST = '-mt-6 divide-y divide-line-soft border-b border-line-soft';

function ToursSkeleton() {
  return (
    <BoneGroup className="min-h-[85vh]">
      <Bone className="aspect-[4/3] sm:aspect-[2/1] lg:aspect-[21/9]" />
      <Bone className="mt-5 h-8 w-72 max-w-full" />
      <Bone className="mt-3 h-5 w-full max-w-md" />
    </BoneGroup>
  );
}

function TransportSkeleton() {
  return (
    <BoneGroup className={`${TRANSPORT_LIST} min-h-[85vh]`}>
      {[1, 2, 3].map((row) => (
        <div key={row} className="flex gap-4 py-5 sm:gap-6">
          <Bone className="aspect-square w-24 shrink-0 sm:w-36" />
          <div className="min-w-0 flex-1">
            <Bone className="h-6 w-full max-w-56" />
            <Bone className="mt-3 h-5 w-full max-w-md" />
          </div>
        </div>
      ))}
    </BoneGroup>
  );
}

// Tab "Local tours": tải mọi tour một lần, rồi lọc theo địa điểm ở trình duyệt.
// Các nút địa điểm được tạo từ chính danh sách tour, nên không có nút nào cho ra danh sách rỗng.
function LocalTours({ location }) {
  const list = useFetch(() => getTours({ limit: LIST_LIMIT }), []);

  if (list.loading) return <ToursSkeleton />;
  if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;

  const tours = list.data.tours;
  if (tours.length === 0) {
    return <EmptyState title="No tours available" message="Please check again later." />;
  }

  const locations = [...new Set(tours.map((tour) => tour.location))].sort();
  // Địa điểm lạ trên địa chỉ trang thì coi như "All locations".
  const active = locations.includes(location) ? location : '';
  const visible = active ? tours.filter((tour) => tour.location === active) : tours;
  const wideCount = visible.length <= 2 ? visible.length : 1;
  const small = visible.slice(wideCount);
  const tabs = [
    { value: '', label: 'All locations' },
    ...locations.map((value) => ({ value, label: value })),
  ];

  return (
    <>
      <FilterTabs
        label="Filter by location"
        className="mb-8"
        tabs={tabs}
        active={active}
        getLink={(value) => `/tours${toQueryString({ location: value })}`}
      />
      <div className="space-y-14">
        {visible.slice(0, wideCount).map((tour) => (
          <TourCard key={tour.id} tour={tour} wide />
        ))}
        {small.length > 0 && (
          <div className={`grid gap-x-8 gap-y-14 ${SMALL_GRIDS[small.length] ?? FALLBACK_GRID}`}>
            {small.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Tab "Transport": một request GET /services (giống trang dịch vụ khách sạn), rồi giữ 3 loại vận chuyển.
// Một request thay vì ba, vì danh sách dịch vụ rất ngắn và trang Services cũng tải cùng cách này.
function TransportServices() {
  const list = useFetch(() => getServices({ limit: LIST_LIMIT }), []);

  if (list.loading) return <TransportSkeleton />;
  if (list.error) return <ErrorState message={list.error.message} onRetry={list.retry} />;

  const order = (service) => TRANSPORT_CATEGORY_KEYS.indexOf(service.category);
  const services = list.data.services
    .filter((service) => isTransportCategory(service.category))
    .sort((a, b) => order(a) - order(b) || a.id - b.id);

  if (services.length === 0) {
    return <EmptyState title="No transport services available" message="Please check again later." />;
  }
  return (
    <div className={TRANSPORT_LIST}>
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
    <div className="shell pt-8 pb-16 lg:pt-12 lg:pb-24">
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
