import { sendError } from '../utils/response.js';

// Đặt sau authenticate, vì middleware này đọc req.user.
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendError(res, 403, 'You do not have permission to perform this action');
  }

  return next();
};

export default requireAdmin;
