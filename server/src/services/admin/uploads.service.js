import { UPLOAD_URL_PREFIX } from '../../config/uploads.js';

// Đường dẫn công khai của ảnh vừa lưu, ví dụ /uploads/2f1c...e9.png.
export const toImageUrl = (filename) => `${UPLOAD_URL_PREFIX}/${filename}`;
