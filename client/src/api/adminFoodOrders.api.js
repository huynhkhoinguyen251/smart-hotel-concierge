import { makeAdminResource } from './adminResource.js';

// Đơn đồ ăn (admin). Danh sách không kèm các món (chỉ có item_count); chi tiết có items.
const resource = makeAdminResource('/admin/food-orders', 'foodOrders');

export const getAdminFoodOrders = resource.list;
export const getAdminFoodOrder = resource.get;
export const updateAdminFoodOrderStatus = (id, status) => resource.updateStatus(id, { status });
