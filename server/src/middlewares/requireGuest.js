import { sendError } from '../utils/response.js';

// Đặt sau authenticate, vì middleware này đọc req.user.
// Chỉ dùng cho các route tạo đơn hoặc yêu cầu của khách: tài khoản admin không được tạo.
const requireGuest = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return sendError(res, 403, 'Admin accounts cannot make guest bookings or requests');
  }

  return next();
};

export default requireGuest;
