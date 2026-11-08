import * as usersModel from '../models/users.model.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';

const EMAIL_TAKEN_MESSAGE = 'Email is already in use';

// Hash của một chuỗi ngẫu nhiên đã bị bỏ đi, nên không mật khẩu nào khớp.
// Khi email không tồn tại vẫn so sánh với hash này, để thời gian phản hồi
// không tiết lộ email nào đã có tài khoản.
const DUMMY_PASSWORD_HASH = '$2b$10$QFoHyDmTnIAbOxk/xbllF.Rb/Y6JwGFBH7fylvI9H7X0ksGkqCufy';

export const register = async ({ full_name, email, password, phone }) => {
  const existingId = await usersModel.findUserIdByEmail(email);
  if (existingId !== null) {
    throw new AppError(409, EMAIL_TAKEN_MESSAGE);
  }

  const passwordHash = await hashPassword(password);

  let insertId;
  try {
    insertId = await usersModel.createUser({
      full_name,
      email,
      password_hash: passwordHash,
      phone,
    });
  } catch (error) {
    // Hai yêu cầu cùng email đến gần như đồng thời đều có thể qua bước kiểm tra ở trên.
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, EMAIL_TAKEN_MESSAGE);
    }
    throw error;
  }

  const user = await usersModel.findUserById(insertId);
  return { token: signToken(user.id), user };
};

export const login = async ({ email, password }) => {
  const account = await usersModel.findUserWithPasswordByEmail(email);

  const isCorrect = await comparePassword(password, account?.password_hash ?? DUMMY_PASSWORD_HASH);
  if (!account || !isCorrect) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!account.is_active) {
    throw new AppError(403, 'Account is locked');
  }

  const { password_hash: _passwordHash, ...user } = account;
  return { token: signToken(user.id), user };
};
