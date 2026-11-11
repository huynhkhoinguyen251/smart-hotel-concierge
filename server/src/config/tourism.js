// Hằng số nghiệp vụ của du lịch (tour và vận chuyển), theo Mục 5 của proposal.md
// và bảng tính tiền ở mục 6 của docs/api.md.
// Trạng thái và luồng trạng thái dùng chung với dịch vụ khách sạn (config/services.js).

// Số người của một đơn tour.
export const MIN_PARTICIPANTS = 1;
export const MAX_PARTICIPANTS = 20;

// Các loại dịch vụ đặt qua /api/transport-bookings.
export const TRANSPORT_CATEGORIES = ['motorbike_rental', 'airport_pickup', 'shuttle'];

// quantity hợp lệ của từng loại: thuê xe máy luôn 1 xe, đón sân bay là số xe,
// xe đưa đón là số người.
export const TRANSPORT_QUANTITY_LIMITS = {
  motorbike_rental: { min: 1, max: 1 },
  airport_pickup: { min: 1, max: 5 },
  shuttle: { min: 1, max: 20 },
};

// Giới hạn rộng nhất của quantity, dùng trong validator. Service kiểm tra theo từng loại.
export const MIN_TRANSPORT_QUANTITY = 1;
export const MAX_TRANSPORT_QUANTITY = 20;

// Thuê xe máy: mỗi 24 giờ bắt đầu tính là 1 ngày, từ 1 đến 30 ngày.
export const HOURS_PER_RENTAL_DAY = 24;
export const MAX_RENTAL_DAYS = 30;

// Loại vận chuyển cần biển số khi admin duyệt (confirmed).
export const PLATE_REQUIRED_CATEGORIES = ['motorbike_rental'];
