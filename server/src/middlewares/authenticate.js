import { findUserById } from '../models/users.model.js';
import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

const authenticate = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }

  // Luôn đọc từ database để vai trò và trạng thái khóa là mới nhất.
  const user = await findUserById(payload.id);

  if (!user) {
    throw new AppError(401, 'Account no longer exists');
  }
  if (!user.is_active) {
    throw new AppError(403, 'Account is locked');
  }

  req.user = user;
  next();
};

export default authenticate;
