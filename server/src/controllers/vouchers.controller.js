import { matchedData } from 'express-validator';
import * as vouchersService from '../services/vouchers.service.js';
import { sendSuccess } from '../utils/response.js';

// Xem trước tiền giảm của một mã trên tạm tính; không giữ lượt dùng.
export const validateVoucher = async (req, res) => {
  const result = await vouchersService.validateVoucher(matchedData(req));
  sendSuccess(res, result, 'Voucher is valid');
};
