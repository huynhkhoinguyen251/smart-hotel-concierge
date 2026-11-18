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

// Bộ hàm cho danh mục admin (dịch vụ, món ăn, tour): GET path (danh sách, có phân trang),
// POST path (thêm), PUT path/:id (sửa toàn bộ: phải gửi đủ mọi trường), DELETE path/:id.
// Không có GET path/:id cho admin, nên form sửa lấy dữ liệu từ dòng trong danh sách.
export const makeAdminCatalogResource = (path, listKey) => ({
  list: async (params = {}) => {
    const body = await client.get(path, { params: cleanParams(params) });
    return { [listKey]: body.data, items: body.data, pagination: body.pagination };
  },
  create: async (data) => {
    const body = await client.post(path, data);
    return body.data;
  },
  update: async (id, data) => {
    const body = await client.put(`${path}/${id}`, data);
    return body.data;
  },
  // Đã có đơn thì backend trả 409; khi đó tắt mục này thay vì xóa.
  remove: async (id) => {
    await client.delete(`${path}/${id}`);
  },
});
