import axios from 'axios';
import { API_URL } from '../config/env.js';
import { clearToken, getToken, SESSION_EXPIRED_EVENT } from '../utils/tokenStorage.js';

// Một instance axios duy nhất cho cả app. Các trang không gọi axios trực tiếp,
// mà gọi qua các file *.api.js.
const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Gắn token vào mọi request khi đã đăng nhập.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thành công: trả phần body { success, data, message, pagination }.
// Lỗi: ném Error thường với message của backend, kèm status để trang xử lý riêng nếu cần.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Cannot connect to the server'));
    }

    const { status, data } = error.response;
    // Token không hợp lệ hoặc hết hạn: xóa phiên và báo cho AuthContext.
    if (status === 401 && getToken()) {
      clearToken();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    const appError = new Error(data?.message || 'Something went wrong. Please try again.');
    appError.status = status;
    return Promise.reject(appError);
  },
);

export default client;
