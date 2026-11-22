import { matchedData } from 'express-validator';
import * as vouchersService from '../../services/admin/vouchers.service.js';
import { sendPaginated, sendSuccess } from '../../utils/response.js';

export const getVouchers = async (req, res) => {
  const { vouchers, pagination } = await vouchersService.listVouchers(matchedData(req));
  sendPaginated(res, vouchers, pagination);
};

export const createVoucher = async (req, res) => {
  const voucher = await vouchersService.createVoucher(matchedData(req));
  sendSuccess(res, voucher, 'Voucher created successfully', 201);
};

export const updateVoucher = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const voucher = await vouchersService.updateVoucher(id, data);
  sendSuccess(res, voucher, 'Voucher updated successfully');
};

export const deleteVoucher = async (req, res) => {
  const { id } = matchedData(req);
  await vouchersService.deleteVoucher(id);
  sendSuccess(res, null, 'Voucher deleted successfully');
};
