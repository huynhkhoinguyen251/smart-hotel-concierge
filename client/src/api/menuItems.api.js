import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Món đang bán, lọc bằng category. Trả { menuItems, pagination }.
export const getMenuItems = async ({ category, page, limit } = {}) => {
  const body = await client.get('/menu-items', { params: cleanParams({ category, page, limit }) });
  return { menuItems: body.data, pagination: body.pagination };
};
