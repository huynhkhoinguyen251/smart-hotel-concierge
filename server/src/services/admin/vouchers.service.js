import { withTransaction } from '../../config/db.js';
import { VOUCHER_DUPLICATE, VOUCHER_IN_USE, VOUCHER_NOT_FOUND } from '../../config/vouchers.js';
import * as vouchersModel from '../../models/vouchers.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';
import { getPagination } from '../../utils/pagination.js';

const VOUCHER_DB_ERRORS = { duplicate: VOUCHER_DUPLICATE, referenced: VOUCHER_IN_USE };

const findVoucherOr404 = async (id, conn) => {
  const voucher = await vouchersModel.findVoucherById(id, conn);
  if (!voucher) {
    throw new AppError(404, VOUCHER_NOT_FOUND);
  }
  return voucher;
};

// Trường không gửi lên nhận giá trị mặc định, dùng chung cho thêm mới và sửa toàn bộ.
const withDefaults = (data) => ({
  ...data,
  min_amount: data.min_amount ?? 0,
  max_uses: data.max_uses ?? null,
  is_active: data.is_active ?? true,
});

// Tất cả voucher, kèm status tính sẵn; tìm theo mã, lọc theo status.
export const listVouchers = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });
  const [vouchers, total] = await Promise.all([
    vouchersModel.findVouchers({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    vouchersModel.countVouchers(filters),
  ]);
  return { vouchers, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

export const createVoucher = async (data) => {
  let id;
  try {
    id = await vouchersModel.createVoucher(withDefaults(data));
  } catch (error) {
    throw mapDbError(error, VOUCHER_DB_ERRORS);
  }
  return findVoucherOr404(id);
};

// Sửa toàn bộ. Khóa voucher để max_uses không bị đặt thấp hơn số lần đã dùng trong lúc có đơn mới.
export const updateVoucher = async (id, data) => {
  await withTransaction(async (conn) => {
    const voucher = await vouchersModel.lockVoucherById(id, conn);
    if (!voucher) {
      throw new AppError(404, VOUCHER_NOT_FOUND);
    }
    const values = withDefaults(data);
    if (values.max_uses !== null && values.max_uses < voucher.used_count) {
      throw new AppError(
        400,
        `Max uses (max_uses) cannot be lower than the ${voucher.used_count} times this voucher has already been used`,
      );
    }
    try {
      await vouchersModel.updateVoucher(id, values, conn);
    } catch (error) {
      throw mapDbError(error, VOUCHER_DB_ERRORS);
    }
  });
  return findVoucherOr404(id);
};

export const deleteVoucher = async (id) => {
  await findVoucherOr404(id);
  if (await vouchersModel.isVoucherUsed(id)) {
    throw new AppError(409, VOUCHER_IN_USE);
  }
  try {
    await vouchersModel.deleteVoucher(id);
  } catch (error) {
    // Có đơn mới dùng voucher ngay sau bước kiểm tra ở trên.
    throw mapDbError(error, VOUCHER_DB_ERRORS);
  }
};
