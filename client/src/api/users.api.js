import client from './client.js';

// Hồ sơ của người dùng đang đăng nhập.
export const getMe = async () => {
  const body = await client.get('/users/me');
  return body.data;
};

// Sửa họ tên và số điện thoại; trả hồ sơ mới.
export const updateMe = async ({ full_name, phone }) => {
  const body = await client.put('/users/me', { full_name, phone });
  return body.data;
};

// Trả thông báo thành công của backend.
export const changePassword = async ({ current_password, new_password }) => {
  const body = await client.put('/users/me/password', { current_password, new_password });
  return body.message;
};
