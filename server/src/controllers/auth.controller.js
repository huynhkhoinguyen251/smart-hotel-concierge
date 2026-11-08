import { matchedData } from 'express-validator';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

// matchedData chỉ lấy các trường đã khai báo trong validator, nên role gửi lên bị bỏ qua.
export const register = async (req, res) => {
  const result = await authService.register(matchedData(req));
  sendSuccess(res, result, 'Registration successful', 201);
};

export const login = async (req, res) => {
  const result = await authService.login(matchedData(req));
  sendSuccess(res, result, 'Login successful');
};
