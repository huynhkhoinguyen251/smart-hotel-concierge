import { makeAdminCatalogResource } from './adminResource.js';
import client from './client.js';

// Voucher (mục 12 của docs/api.md).

// Xem trước tiền giảm của một mã trên tạm tính (amount); không giữ lượt dùng.
// Trả { code, discount_type, discount_value, discount_amount, total_after_discount, min_amount, ends_at }.
// Lỗi 400/404 kèm lý do (hết hạn, chưa đủ tiền...).
export const validateVoucher = async ({ code, amount }) => {
  const body = await client.post('/vouchers/validate', { code, amount });
  return body.data;
};

// Admin: list({ search, status, page, limit }) → { vouchers, items, pagination }, create, update (sửa toàn bộ), remove.
export const adminVouchersApi = makeAdminCatalogResource('/admin/vouchers', 'vouchers');
