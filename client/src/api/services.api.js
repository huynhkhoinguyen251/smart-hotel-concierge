import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Dịch vụ đang hoạt động, lọc bằng category. Trả { services, pagination }.
// Danh sách có cả dịch vụ vận chuyển; trang dịch vụ khách sạn tự lọc lại.
export const getServices = async ({ category, page, limit } = {}) => {
  const body = await client.get('/services', { params: cleanParams({ category, page, limit }) });
  return { services: body.data, pagination: body.pagination };
};

export const getService = async (id) => {
  const body = await client.get(`/services/${id}`);
  return body.data;
};
