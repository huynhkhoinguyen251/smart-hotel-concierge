import { adminMenuItemsApi } from '../../api/adminCatalog.api.js';
import { CatalogItemCell, PriceCell } from '../../components/admin/AdminCells.jsx';
import CatalogListPage from '../../components/admin/catalog/CatalogListPage.jsx';
import AdminSubNav from '../../components/admin/AdminSubNav.jsx';
import { ADMIN_MENU_CATEGORY_OPTIONS, MENU_ITEM_FIELDS } from '../../config/adminCatalogItems.js';
import { getMenuCategoryLabel } from '../../config/food.js';
import { FOOD_SECTION_NAV } from '../../config/adminCatalog.js';

const CATALOG = {
  noun: 'menu item',
  nounPlural: 'menu items',
  fields: MENU_ITEM_FIELDS,
  flag: 'is_available',
  flagLabels: { on: 'Available', off: 'Unavailable' },
  flagHint: 'Guests can see and order this item. Switch it off when it runs out.',
  api: adminMenuItemsApi,
};

const FILTERS = [
  { name: 'category', label: 'Category', options: [{ value: '', label: 'All categories' }, ...ADMIN_MENU_CATEGORY_OPTIONS] },
];

const COLUMNS = [
  {
    key: 'item',
    header: 'Menu item',
    render: (item) => <CatalogItemCell item={item} status={item.is_available ? 'available' : 'unavailable'} />,
  },
  { key: 'category', header: 'Category', render: (item) => getMenuCategoryLabel(item.category) },
  { key: 'price', header: 'Price', align: 'right', render: (item) => <PriceCell amount={item.price} /> },
];

// /admin/food-orders/menu: thực đơn, kể cả món đang tắt.
export default function AdminMenuPage() {
  return (
    <CatalogListPage
      title="Menu"
      subtitle="Food, coffee and drinks for room delivery, including unavailable items."
      subNav={<AdminSubNav {...FOOD_SECTION_NAV} />}
      catalog={CATALOG}
      filters={FILTERS}
      columns={COLUMNS}
    />
  );
}
