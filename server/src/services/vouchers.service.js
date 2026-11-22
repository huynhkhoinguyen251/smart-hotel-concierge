import { VOUCHER_NOT_FOUND } from '../config/vouchers.js';
import * as vouchersModel from '../models/vouchers.model.js';
import AppError from '../utils/AppError.js';
import { formatDisplayDate } from '../utils/date.js';
import { formatVnd, fromCents, toCents } from '../utils/money.js';

// Voucher của đơn đặt phòng và đơn đồ ăn (mục 12 của docs/api.md).

// Số tiền giảm trên tạm tính (subtotal): percent → làm tròn xuống đồng (VND chẵn),
// fixed → đúng giá trị. Không bao giờ lớn hơn subtotal.
export const computeDiscount = (voucher, subtotal) => {
  const raw =
    voucher.discount_type === 'percent'
      ? Math.floor((Number(subtotal) * voucher.discount_value) / 100 + 1e-9)
      : voucher.discount_value;
  return Math.min(raw, Number(subtotal));
};

// Tổng sau giảm, tính theo xu để tránh sai số số thực.
export const totalAfterDiscount = (subtotal, discount) => fromCents(toCents(subtotal) - toCents(discount));

const ensureMinAmount = (voucher, subtotal) => {
  if (Number(subtotal) < voucher.min_amount) {
    throw new AppError(400, `Spend at least ${formatVnd(voucher.min_amount)} to use this voucher`);
  }
};

// Voucher dùng được không, kèm lý do nếu không. status do database tính (giờ của database).
const ensureUsable = (voucher, subtotal) => {
  if (!voucher) {
    throw new AppError(404, VOUCHER_NOT_FOUND);
  }
  switch (voucher.status) {
    case 'inactive':
      throw new AppError(400, 'This voucher is not active');
    case 'scheduled':
      throw new AppError(400, `This voucher is not active yet. It starts on ${formatDisplayDate(voucher.starts_at)}`);
    case 'expired':
      throw new AppError(400, 'This voucher has expired');
    case 'used_up':
      throw new AppError(400, 'This voucher has been fully used');
    default:
      ensureMinAmount(voucher, subtotal);
  }
};

// Dùng voucher cho một đơn mới, trong transaction của đơn: khóa voucher, kiểm tra, tính tiền giảm
// và tăng used_count. Hai khách tranh lượt cuối thì người sau phải chờ khóa rồi bị từ chối.
// Trả { voucherId, discountAmount, total }.
export const applyVoucherInTransaction = async (conn, code, subtotal) => {
  const voucher = await vouchersModel.lockVoucherByCode(code, conn);
  ensureUsable(voucher, subtotal);
  const discountAmount = computeDiscount(voucher, subtotal);
  await vouchersModel.incrementUsedCount(voucher.id, conn);
  return { voucherId: voucher.id, discountAmount, total: totalAfterDiscount(subtotal, discountAmount) };
};

// Đổi ngày đơn đặt phòng: tính lại tiền giảm của chính voucher đó trên subtotal mới.
// Không xét lại thời gian và số lần dùng (đã kiểm tra lúc đặt), nhưng vẫn cần đủ min_amount.
export const recomputeVoucherDiscount = async (conn, voucherId, subtotal) => {
  const voucher = await vouchersModel.findVoucherById(voucherId, conn);
  if (!voucher) {
    return { discountAmount: 0, total: Number(subtotal) };
  }
  ensureMinAmount(voucher, subtotal);
  const discountAmount = computeDiscount(voucher, subtotal);
  return { discountAmount, total: totalAfterDiscount(subtotal, discountAmount) };
};

// Đơn có voucher bị hủy (khách, admin, hủy theo đơn đặt phòng, quá hạn thanh toán): trả lại lượt dùng.
export const releaseVoucher = (conn, kind, orderId) => vouchersModel.releaseVoucherOfOrder(kind, orderId, conn);

// POST /vouchers/validate: xem trước, không giữ lượt dùng.
export const validateVoucher = async ({ code, amount }) => {
  const voucher = await vouchersModel.findVoucherByCode(code);
  ensureUsable(voucher, amount);
  const discountAmount = computeDiscount(voucher, amount);
  return {
    code: voucher.code,
    discount_type: voucher.discount_type,
    discount_value: voucher.discount_value,
    discount_amount: discountAmount,
    total_after_discount: totalAfterDiscount(amount, discountAmount),
    min_amount: voucher.min_amount,
    ends_at: voucher.ends_at,
  };
};
