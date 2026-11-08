import AppError from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

// Express chỉ nhận đây là middleware xử lý lỗi khi hàm có đủ 4 tham số.
const errorHandler = (err, req, res, next) => {
  // Phản hồi đã gửi dở thì không gửi lại được, nên để Express tự đóng kết nối.
  if (res.headersSent) {
    return next(err);
  }

  // Lỗi nghiệp vụ do code chủ động báo, thông báo an toàn để trả cho người dùng.
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  // JSON sai cú pháp là lỗi của dữ liệu gửi lên, không phải lỗi server.
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON data');
  }

  // Các lỗi 4xx khác khi đọc dữ liệu gửi lên, ví dụ dữ liệu quá lớn.
  if (err.status >= 400 && err.status < 500) {
    return sendError(res, 400, 'Invalid request data');
  }

  console.error('Unhandled error:', err);
  return sendError(res, 500, 'Internal server error');
};

export default errorHandler;
