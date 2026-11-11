// Nơi duy nhất đọc biến môi trường của frontend (file .env, xem .env.example).

const DEFAULT_API_URL = 'http://localhost:5000/api';

// Bỏ dấu / ở cuối để ghép đường dẫn không bị trùng.
export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

// Địa chỉ gốc của backend, không có /api. Ảnh upload được phục vụ tại đây, ví dụ /uploads/x.jpg.
export const API_ORIGIN = API_URL.replace(/\/api$/, '');
