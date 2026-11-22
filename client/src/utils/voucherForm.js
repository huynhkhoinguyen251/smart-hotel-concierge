import { PRICE_PATTERN } from '../config/adminCatalog.js';
import {
  MAX_PERCENT,
  MAX_VOUCHER_CODE_LENGTH,
  MIN_PERCENT,
  normalizeVoucherCode,
  VOUCHER_CODE_PATTERN,
} from '../config/vouchers.js';
import { isDateTimeLocal, toApiDateTime } from './dateHelpers.js';
import formatCurrency from './formatCurrency.js';

// Form voucher của admin. Kiểm tra giống validator của backend (backend vẫn kiểm tra lại).

// "2026-11-01 00:00:00" (backend) thành "2026-11-01T00:00" (ô datetime-local).
const toInputDateTime = (value) => (typeof value === 'string' ? value.slice(0, 16).replace(' ', 'T') : '');

// Ô datetime-local thành "YYYY-MM-DD HH:mm:ss". Không đổi phút thì giữ nguyên giây cũ (ví dụ 23:59:59).
const toApiDateTimeSeconds = (value, original) =>
  original && toInputDateTime(original) === value ? original : `${toApiDateTime(value)}:00`;

export const toVoucherForm = (voucher) => ({
  code: voucher?.code ?? '',
  discount_type: voucher?.discount_type ?? 'percent',
  discount_value: voucher ? String(voucher.discount_value) : '',
  min_amount: voucher ? String(voucher.min_amount) : '0',
  max_uses: voucher?.max_uses === null || voucher?.max_uses === undefined ? '' : String(voucher.max_uses),
  starts_at: toInputDateTime(voucher?.starts_at),
  ends_at: toInputDateTime(voucher?.ends_at),
  is_active: voucher ? voucher.is_active : true,
});

// Trả { tên ô: lỗi }; object rỗng là hợp lệ. usedCount: số lần đã dùng (khi sửa).
export const validateVoucherForm = (form, { usedCount = 0 } = {}) => {
  const errors = {};
  const code = normalizeVoucherCode(form.code);
  if (!code) errors.code = 'Code is required';
  else if (code.length > MAX_VOUCHER_CODE_LENGTH || !VOUCHER_CODE_PATTERN.test(code)) {
    errors.code = `Use up to ${MAX_VOUCHER_CODE_LENGTH} letters, numbers, "-" or "_"`;
  }

  const value = String(form.discount_value).trim();
  if (form.discount_type === 'percent') {
    if (!/^\d+$/.test(value) || Number(value) < MIN_PERCENT || Number(value) > MAX_PERCENT) {
      errors.discount_value = `Enter a whole number from ${MIN_PERCENT} to ${MAX_PERCENT}`;
    }
  } else if (!PRICE_PATTERN.test(value) || Number(value) <= 0) {
    errors.discount_value = 'Enter an amount greater than 0, with at most 2 decimal places';
  }

  const minAmount = String(form.min_amount).trim();
  if (minAmount && !PRICE_PATTERN.test(minAmount)) {
    errors.min_amount = 'Enter an amount of at least 0, with at most 2 decimal places';
  }

  const maxUses = String(form.max_uses).trim();
  if (maxUses) {
    if (!/^\d+$/.test(maxUses) || Number(maxUses) < 1) errors.max_uses = 'Leave empty for unlimited, or enter a whole number of at least 1';
    else if (Number(maxUses) < usedCount) errors.max_uses = `Cannot be lower than the ${usedCount} times already used`;
  }

  if (!isDateTimeLocal(form.starts_at)) errors.starts_at = 'Choose the start date and time';
  if (!isDateTimeLocal(form.ends_at)) errors.ends_at = 'Choose the end date and time';
  else if (isDateTimeLocal(form.starts_at) && form.ends_at <= form.starts_at) {
    errors.ends_at = 'The end must be after the start';
  }
  return errors;
};

// Dữ liệu gửi lên cho POST và PUT (PUT sửa toàn bộ, nên luôn gửi đủ). original: voucher đang sửa.
export const toVoucherPayload = (form, original = null) => ({
  code: normalizeVoucherCode(form.code),
  discount_type: form.discount_type,
  discount_value: Number(form.discount_value),
  min_amount: Number(String(form.min_amount).trim() || 0),
  max_uses: String(form.max_uses).trim() ? Number(form.max_uses) : null,
  starts_at: toApiDateTimeSeconds(form.starts_at, original?.starts_at),
  ends_at: toApiDateTimeSeconds(form.ends_at, original?.ends_at),
  is_active: Boolean(form.is_active),
});

// Bật/tắt nhanh: gửi lại đúng dữ liệu của voucher, chỉ đổi is_active.
export const toVoucherToggle = (voucher, isActive) => ({
  code: voucher.code,
  discount_type: voucher.discount_type,
  discount_value: voucher.discount_value,
  min_amount: voucher.min_amount,
  max_uses: voucher.max_uses,
  starts_at: voucher.starts_at,
  ends_at: voucher.ends_at,
  is_active: isActive,
});

// "10%" hoặc "50,000 VND".
export const formatVoucherDiscount = (voucher) =>
  voucher.discount_type === 'percent' ? `${Number(voucher.discount_value)}%` : formatCurrency(voucher.discount_value);

// "2 / 100" hoặc "2 / unlimited".
export const formatVoucherUses = (voucher) =>
  `${voucher.used_count} / ${voucher.max_uses === null ? 'unlimited' : voucher.max_uses}`;
