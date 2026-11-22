// Tính tiền theo đơn vị xu (x100) để tránh sai số khi nhân và cộng số thập phân trong JavaScript.

export const toCents = (amount) => Math.round(amount * 100);
export const fromCents = (cents) => cents / 100;

// Đơn giá x số lượng, ví dụ giá x số người hoặc giá x số ngày thuê.
export const multiplyPrice = (unitPrice, quantity) => fromCents(toCents(unitPrice) * quantity);

const vndFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

// 1000000 thành "1,000,000 VND", dùng trong thông báo lỗi.
export const formatVnd = (amount) => `${vndFormat.format(Number(amount))} VND`;
