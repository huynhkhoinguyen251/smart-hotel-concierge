import { cleanParams } from '../utils/queryString.js';
import client from './client.js';

// Quản lý người dùng (admin). Không bao giờ có password_hash.

// Lọc bằng search (họ tên, email, số điện thoại), role (user, admin), is_active ('true', 'false').
// Người mới nhất trước. Trả { users, items, pagination }.
export const getAdminUsers = async (params = {}) => {
  const body = await client.get('/admin/users', { params: cleanParams(params) });
  return { users: body.data, items: body.data, pagination: body.pagination };
};

export const getAdminUser = async (id) => {
  const body = await client.get(`/admin/users/${id}`);
  return body.data;
};

// Khóa hoặc mở khóa. Tự đổi tài khoản của chính mình thì backend trả 400. Trả người dùng sau khi đổi.
export const updateAdminUserStatus = async (id, isActive) => {
  const body = await client.patch(`/admin/users/${id}/status`, { is_active: isActive });
  return body.data;
};

// role: 'user' hoặc 'admin'. Tự đổi vai trò của chính mình thì 400.
export const updateAdminUserRole = async (id, role) => {
  const body = await client.patch(`/admin/users/${id}/role`, { role });
  return body.data;
};
