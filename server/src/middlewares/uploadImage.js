import { randomUUID } from 'node:crypto';
import { open, rm } from 'node:fs/promises';
import multer from 'multer';
import { UPLOAD_DIR } from '../config/uploads.js';
import AppError from '../utils/AppError.js';

const FIELD_NAME = 'image';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Loại file được nhận và đuôi file tương ứng. Tên file gốc không bao giờ được dùng.
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Loại file do trình duyệt gửi lên có thể bị giả, nên kiểm tra thêm vài byte đầu của file.
const SIGNATURES = {
  'image/jpeg': (header) => header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
  'image/png': (header) =>
    header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (header) =>
    header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, callback) => callback(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 10 },
  fileFilter: (req, file, callback) => {
    if (EXTENSIONS[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new AppError(400, 'Only JPEG, PNG and WebP images are allowed'));
    }
  },
}).single(FIELD_NAME);

const readHeader = async (filePath) => {
  const handle = await open(filePath, 'r');
  try {
    const header = Buffer.alloc(12);
    await handle.read(header, 0, header.length, 0);
    return header;
  } finally {
    await handle.close();
  }
};

// Đổi lỗi của multer thành lỗi 400 với message tiếng Anh.
const toUploadError = (error) => {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new AppError(400, 'Image must be at most 5 MB');
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE' || error.code === 'LIMIT_FILE_COUNT') {
      return new AppError(400, `Send exactly one image in the "${FIELD_NAME}" field`);
    }
    return new AppError(400, 'Invalid upload data');
  }
  // Lỗi hệ thống như hết dung lượng đĩa vẫn là lỗi 500.
  if (error.syscall) {
    return error;
  }
  // Còn lại là dữ liệu multipart bị hỏng, ví dụ thiếu boundary.
  return new AppError(400, 'Invalid upload data');
};

// Nhận một ảnh ở field "image", lưu vào server/uploads/ và gán vào req.file.
const uploadImage = (req, res, next) => {
  upload(req, res, async (error) => {
    try {
      if (error) {
        throw toUploadError(error);
      }
      if (!req.file) {
        throw new AppError(400, `Please choose an image file in the "${FIELD_NAME}" field`);
      }

      const header = await readHeader(req.file.path);
      if (!SIGNATURES[req.file.mimetype](header)) {
        await rm(req.file.path, { force: true });
        throw new AppError(400, 'The file is not a valid JPEG, PNG or WebP image');
      }

      next();
    } catch (err) {
      next(err);
    }
  });
};

export default uploadImage;
