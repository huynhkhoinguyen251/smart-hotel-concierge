import { matchedData } from 'express-validator';
import * as usersService from '../../services/admin/users.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getUsers = async (req, res) => {
  const { users, pagination } = await usersService.listUsers(matchedData(req));
  sendPaginated(res, users, pagination);
};

export const getUser = async (req, res) => {
  const { id } = matchedData(req);
  const user = await usersService.getUser(id);
  sendSuccess(res, user, 'User retrieved successfully');
};

// req.user là admin đang đăng nhập, dùng để chặn việc tự khóa hoặc tự đổi vai trò.
export const updateUserStatus = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const user = await usersService.updateUserStatus(req.user.id, id, data);
  sendSuccess(res, user, 'User status updated successfully');
};

export const updateUserRole = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const user = await usersService.updateUserRole(req.user.id, id, data);
  sendSuccess(res, user, 'User role updated successfully');
};
