import { TOURISM_SECTION_TABS } from '../../config/adminCatalog.js';
import AdminSubNav from './AdminSubNav.jsx';

// Tab phụ của mục Tourism: đơn tour, đơn vận chuyển và danh mục tour.
export default function TourismTabs() {
  return <AdminSubNav tabs={TOURISM_SECTION_TABS} label="Tourism sections" />;
}
