import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Đặt món. items: [{ menu_item_id, quantity }]. Không gửi giá: backend tự lấy giá và tính tổng tiền.
export const createFoodOrder = async ({ booking_id, items, note }) => {
  const body = await client.post('/food-orders', {
    booking_id,
    items: items.map(({ menu_item_id, quantity }) => ({ menu_item_id, quantity })),
    ...(note ? { note } : {}),
  });
  return body.data;
};

// Đơn đồ ăn của tôi, mới nhất trước, không kèm các món. Trả { foodOrders, pagination }.
export const getMyFoodOrders = async ({ status, page, limit } = {}) => {
  const body = await client.get('/food-orders', { params: cleanParams({ status, page, limit }) });
  return { foodOrders: body.data, pagination: body.pagination };
};

// Chi tiết đơn, kèm items.
export const getFoodOrder = async (id) => {
  const body = await client.get(`/food-orders/${id}`);
  return body.data;
};

// Chỉ hủy được khi đơn còn pending. Trả đơn sau khi hủy (kèm items).
export const cancelFoodOrder = async (id) => {
  const body = await client.patch(`/food-orders/${id}/cancel`);
  return body.data;
};
