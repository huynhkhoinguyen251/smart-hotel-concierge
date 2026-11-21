// Các hàm trả phản hồi theo định dạng trong docs/api.md.

// extra: trường thêm ở cấp ngoài cùng, ví dụ { unread_count } của API thông báo.
export const sendSuccess = (res, data, message, statusCode = 200, extra = {}) =>
  res.status(statusCode).json({ success: true, data, message, ...extra });

export const sendPaginated = (res, data, { page, limit, total }, extra = {}) =>
  res.status(200).json({ success: true, data, pagination: { page, limit, total }, ...extra });

export const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });
