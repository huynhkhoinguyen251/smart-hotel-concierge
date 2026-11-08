import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Thư mục server/uploads/. Tạo sẵn nếu chưa có, vì multer cần thư mục tồn tại.
export const UPLOAD_DIR = fileURLToPath(new URL('../../uploads/', import.meta.url));

// Đường dẫn công khai của ảnh, phục vụ ngoài /api.
export const UPLOAD_URL_PREFIX = '/uploads';

mkdirSync(UPLOAD_DIR, { recursive: true });
