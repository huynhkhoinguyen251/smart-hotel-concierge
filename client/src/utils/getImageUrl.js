import { API_ORIGIN } from '../config/env.js';

// Link http(s) đầy đủ giữ nguyên. Ảnh upload lên backend có dạng /uploads/x.jpg và được phục vụ
// ở địa chỉ gốc của backend (không có /api), nên ghép thêm API_ORIGIN.
export default function getImageUrl(path) {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}
