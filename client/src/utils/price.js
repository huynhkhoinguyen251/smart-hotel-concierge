// Tính tiền theo đồng xu (x100) để tránh sai số số thực. Giá từ backend có thể là chuỗi "75000.00".
// Dùng chung cho giỏ đồ ăn, tour, vận chuyển và các trang chi tiết đơn.
const toCents = (amount) => Math.round(Number(amount) * 100);

// Giá x số lượng (người, ngày, xe...).
export const multiplyPrice = (price, quantity) => (toCents(price) * quantity) / 100;

export const sumPrices = (amounts) => amounts.reduce((sum, amount) => sum + toCents(amount), 0) / 100;
