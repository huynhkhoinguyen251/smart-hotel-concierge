import { makeAdminCatalogResource } from './adminResource.js';

// Danh mục dịch vụ, thực đơn và tour (admin), mục 9 của docs/api.md.
// Danh sách gồm cả mục đã tắt. Lọc:
// - dịch vụ: category (8 loại, kể cả 3 loại vận chuyển), is_active
// - món ăn: category (food, coffee, drink), is_available
// - tour: location (so khớp chính xác), is_active
export const adminServicesApi = makeAdminCatalogResource('/admin/services', 'services');
export const adminMenuItemsApi = makeAdminCatalogResource('/admin/menu-items', 'menuItems');
export const adminToursApi = makeAdminCatalogResource('/admin/tours', 'tours');
