import { adminToursApi } from '../../api/adminCatalog.api.js';
import { CatalogItemCell, PriceCell } from '../../components/admin/AdminCells.jsx';
import CatalogListPage from '../../components/admin/catalog/CatalogListPage.jsx';
import TourismTabs from '../../components/admin/TourismTabs.jsx';
import { TOUR_LOCATION_MAX_LENGTH } from '../../config/adminCatalog.js';
import { TOUR_FIELDS } from '../../config/adminCatalogItems.js';

const CATALOG = {
  noun: 'tour',
  nounPlural: 'tours',
  fields: TOUR_FIELDS,
  flag: 'is_active',
  flagLabels: { on: 'Active', off: 'Inactive' },
  flagHint: 'Guests can see and book this tour. Switch it off to hide it.',
  api: adminToursApi,
};

// Backend so khớp chính xác địa điểm (ví dụ "Da Nang"), không tìm một phần.
const SEARCH = {
  name: 'location',
  label: 'Location (exact name)',
  placeholder: 'For example: Da Nang',
  maxLength: TOUR_LOCATION_MAX_LENGTH,
};

const COLUMNS = [
  {
    key: 'tour',
    header: 'Tour',
    render: (tour) => <CatalogItemCell item={tour} status={tour.is_active ? 'active' : 'inactive'} />,
  },
  { key: 'location', header: 'Location', render: (tour) => tour.location },
  { key: 'duration', header: 'Duration', render: (tour) => tour.duration },
  { key: 'price', header: 'Price', align: 'right', render: (tour) => <PriceCell amount={tour.price} unit="per person" /> },
];

// /admin/tourism/catalog: danh mục tour, kể cả tour đã tắt.
export default function AdminTourCatalogPage() {
  return (
    <CatalogListPage
      title="Tourism"
      subtitle="Local tours offered to guests, including inactive ones."
      subNav={<TourismTabs />}
      catalog={CATALOG}
      search={SEARCH}
      columns={COLUMNS}
    />
  );
}
