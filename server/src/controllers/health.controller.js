import * as healthModel from '../models/health.model.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getHealth = async (req, res) => {
  try {
    await healthModel.checkConnection();
    sendSuccess(res, { database: 'connected' }, 'Server is running normally');
  } catch (error) {
    // Chi tiết lỗi chỉ ghi ra terminal, không trả cho người dùng.
    console.error('Database connection error:', error);
    sendError(res, 500, 'Cannot connect to the database');
  }
};
