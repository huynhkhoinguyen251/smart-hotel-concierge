import { FOOD_SECTION_TABS } from '../../config/adminCatalog.js';
import AdminSubNav from './AdminSubNav.jsx';

// Tab phụ của mục Food Orders: đơn đồ ăn và thực đơn.
export default function FoodTabs() {
  return <AdminSubNav tabs={FOOD_SECTION_TABS} label="Food sections" />;
}
