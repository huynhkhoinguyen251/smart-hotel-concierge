// Voucher giảm giá (mục 12 của docs/api.md). Chỉ áp dụng cho đơn đặt phòng và đơn đồ ăn
// (hai bảng có cột voucher_id). Mỗi đơn dùng tối đa một voucher.

export const DISCOUNT_TYPES = ['percent', 'fixed'];

// Mã không phân biệt hoa thường: trim rồi viết hoa. Chỉ gồm A-Z, 0-9, "-" và "_".
export const MAX_VOUCHER_CODE_LENGTH = 50;
export const VOUCHER_CODE_PATTERN = /^[A-Z0-9_-]+$/;
export const normalizeVoucherCode = (value) => String(value ?? '').trim().toUpperCase();

// Giảm theo phần trăm: 1-100.
export const MIN_PERCENT = 1;
export const MAX_PERCENT = 100;

// Trạng thái tính từ is_active, thời gian (giờ của database) và số lần dùng.
export const VOUCHER_STATUSES = ['active', 'scheduled', 'expired', 'inactive', 'used_up'];

// Bảng có cột voucher_id, theo loại đơn.
export const VOUCHER_ORDER_TABLES = { room: 'bookings', food_order: 'food_orders' };

export const VOUCHER_NOT_FOUND = 'Voucher not found';
export const VOUCHER_IN_USE = 'This voucher has been used and cannot be deleted. Switch it off instead.';
export const VOUCHER_DUPLICATE = 'A voucher with this code already exists';
