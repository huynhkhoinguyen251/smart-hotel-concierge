import { adminServicesApi } from '../../api/adminCatalog.api.js';
import { CatalogItemCell, PriceCell } from '../../components/admin/AdminCells.jsx';
import CatalogListPage from '../../components/admin/catalog/CatalogListPage.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import { SERVICE_SECTION_NAV, TRANSPORT_SERVICES_NOTE } from '../../config/adminCatalog.js';
import {
  ADMIN_SERVICE_CATEGORY_OPTIONS,
  getAdminServiceCategoryLabel,
  getAdminServicePriceUnit,
  SERVICE_FIELDS,
} from '../../config/adminCatalogItems.js';

const CATALOG = {
  noun: 'service',
  nounPlural: 'services',
  fields: SERVICE_FIELDS,
  flag: 'is_active',
  flagLabels: { on: 'Active', off: 'Inactive' },
  flagHint: 'Guests can see and book this service. Switch it off to hide it.',
  api: adminServicesApi,
};

const FILTERS = [
  { name: 'category', label: 'Category', options: [{ value: '', label: 'All categories' }, ...ADMIN_SERVICE_CATEGORY_OPTIONS] },
];

const COLUMNS = [
  {
    key: 'service',
    header: 'Service',
    render: (service) => <CatalogItemCell item={service} status={service.is_active ? 'active' : 'inactive'} />,
  },
  { key: 'category', header: 'Category', render: (service) => getAdminServiceCategoryLabel(service.category) },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    render: (service) => <PriceCell amount={service.price} unit={getAdminServicePriceUnit(service.category)} />,
  },
];

// /admin/services/catalog: danh mục dịch vụ, kể cả 3 loại vận chuyển và dịch vụ đã tắt.
export default function AdminServiceCatalogPage() {
  return (
    <CatalogListPage
      title="Service catalog"
      subtitle="Hotel services and transport services, including inactive ones."
      subNav={<AdminSubNav {...SERVICE_SECTION_NAV} />}
      note={TRANSPORT_SERVICES_NOTE}
      catalog={CATALOG}
      filters={FILTERS}
      columns={COLUMNS}
    />
  );
}
