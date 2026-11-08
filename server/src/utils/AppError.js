// Lỗi nghiệp vụ có mã trạng thái. errorHandler sẽ trả thông báo này cho người dùng.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default AppError;
