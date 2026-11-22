// Voucher (mục 12 của docs/api.md). Giới hạn giống backend (server/src/config/vouchers.js).

export const MAX_VOUCHER_CODE_LENGTH = 50;
export const VOUCHER_CODE_PATTERN = /^[A-Z0-9_-]+$/;
export const normalizeVoucherCode = (value) => String(value ?? '').trim().toUpperCase();

export const MIN_PERCENT = 1;
export const MAX_PERCENT = 100;

export const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percent', label: 'Percent (%)' },
  { value: 'fixed', label: 'Fixed amount (VND)' },
];

// Tab trạng thái ở trang admin; nhãn và màu của badge nằm trong config/statuses.js.
export const VOUCHER_STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'used_up', label: 'Used up' },
];

export const ADMIN_VOUCHERS_PAGE_SIZE = 10;
export const VOUCHER_IN_USE_NOTE = 'This voucher has been used and cannot be deleted. Switch it off instead.';
export const SWITCH_OFF_VOUCHER_NOTE = 'Guests will no longer be able to use this code. Existing orders keep their discount.';

// Nhãn dòng giảm giá ở trang chi tiết đơn và hóa đơn: "Discount (WELCOME10)" hoặc "Discount".
export const getDiscountLabel = (code) => (code ? `Discount (${code})` : 'Discount');
