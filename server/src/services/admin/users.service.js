import * as usersModel from '../../models/users.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';

const USER_NOT_FOUND = 'User not found';

const findUserOr404 = async (id) => {
  const user = await usersModel.findUserById(id);
  if (!user) {
    throw new AppError(404, USER_NOT_FOUND);
  }
  return user;
};

// Danh sách không bao giờ có password_hash (model chỉ chọn các cột trong USER_COLUMNS).
export const listUsers = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [users, total] = await Promise.all([
    usersModel.findUsers({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    usersModel.countUsers(filters),
  ]);

  return { users, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

export const getUser = (id) => findUserOr404(id);

// Admin không tự khóa và không tự đổi vai trò của chính mình, nên hệ thống luôn còn
// ít nhất một admin đang hoạt động. Gửi lại đúng giá trị hiện tại vẫn thành công.
// Tài khoản bị khóa bị chặn ngay ở middleware authenticate, vì nó luôn đọc trạng thái mới nhất.
export const updateUserStatus = async (adminId, id, { is_active }) => {
  await findUserOr404(id);
  if (id === adminId) {
    throw new AppError(400, 'You cannot change the status of your own account');
  }

  await usersModel.updateUserStatus(id, is_active);
  return findUserOr404(id);
};

export const updateUserRole = async (adminId, id, { role }) => {
  await findUserOr404(id);
  if (id === adminId) {
    throw new AppError(400, 'You cannot change your own role');
  }

  await usersModel.updateUserRole(id, role);
  return findUserOr404(id);
};
