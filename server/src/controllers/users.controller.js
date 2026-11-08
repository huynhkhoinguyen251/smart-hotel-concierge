import { matchedData } from 'express-validator';
import * as usersService from '../services/users.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMe = (req, res) => {
  sendSuccess(res, req.user, 'Profile retrieved successfully');
};

export const updateMe = async (req, res) => {
  // includeOptionals để giữ phone = null, nghĩa là xóa số điện thoại.
  const data = matchedData(req, { includeOptionals: true });
  const user = await usersService.updateProfile(req.user.id, data);
  sendSuccess(res, user, 'Profile updated successfully');
};

export const changePassword = async (req, res) => {
  await usersService.changePassword(req.user.id, matchedData(req));
  sendSuccess(res, null, 'Password changed successfully');
};
