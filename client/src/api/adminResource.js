import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Tạo bộ hàm gọi API admin cho một loại đơn có cùng dạng:
// GET path (danh sách, có phân trang), GET path/:id (chi tiết), PATCH path/:id/status.
// listKey: tên mảng trong kết quả của list, ví dụ 'foodOrders'.
export const makeAdminResource = (path, listKey) => ({
  // Trả { [listKey]: [...], items: [...], pagination }. items dùng cho các component chung.
  list: async (params = {}) => {
    const body = await client.get(path, { params: cleanParams(params) });
    return { [listKey]: body.data, items: body.data, pagination: body.pagination };
  },
  get: async (id) => {
    const body = await client.get(`${path}/${id}`);
    return body.data;
  },
  // Sai luồng trạng thái thì backend trả 400 kèm thông báo. Trả đơn sau khi đổi.
  updateStatus: async (id, data) => {
    const body = await client.patch(`${path}/${id}/status`, data);
    return body.data;
  },
});
