import * as usersModel from '../models/users.model.js';
import AppError from '../utils/AppError.js';
import { comparePassword, hashPassword } from '../utils/password.js';

export const updateProfile = async (userId, data) => {
  await usersModel.updateUserProfile(userId, data);
  return usersModel.findUserById(userId);
};

export const changePassword = async (userId, { current_password, new_password }) => {
  const currentHash = await usersModel.findPasswordHashById(userId);
  const isCorrect = await comparePassword(current_password, currentHash);

  if (!isCorrect) {
    throw new AppError(400, 'Current password is incorrect');
  }

  const passwordHash = await hashPassword(new_password);
  await usersModel.updateUserPassword(userId, passwordHash);
};
