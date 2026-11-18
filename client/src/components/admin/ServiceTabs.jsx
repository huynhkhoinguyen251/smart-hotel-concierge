import { SERVICE_SECTION_TABS } from '../../config/adminCatalog.js';
import AdminSubNav from './AdminSubNav.jsx';

// Tab phụ của mục Services: yêu cầu dịch vụ của khách và danh mục dịch vụ.
export default function ServiceTabs() {
  return <AdminSubNav tabs={SERVICE_SECTION_TABS} label="Services sections" />;
}
