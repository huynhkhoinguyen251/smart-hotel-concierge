// Các hàm trả phản hồi theo định dạng trong docs/api.md.

export const sendSuccess = (res, data, message, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

export const sendPaginated = (res, data, { page, limit, total }) =>
  res.status(200).json({ success: true, data, pagination: { page, limit, total } });

export const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });
