// Thống kê cho admin (mục 9 của docs/api.md). Thẻ số liệu và biểu đồ dùng chung tên và màu ở đây.

// Màu đã được kiểm tra cho người mù màu; thứ tự và màu của mỗi nguồn không đổi ở mọi nơi.
// 5 nguồn doanh thu, theo đúng thứ tự backend trả (server/src/config/stats.js).
export const REVENUE_SOURCES = [
  { key: 'rooms', label: 'Rooms', color: '#1b7fa8' },
  { key: 'services', label: 'Services', color: '#e0921a' },
  { key: 'food', label: 'Food', color: '#1b8a5a' },
  { key: 'tours', label: 'Tours', color: '#7a5cc7' },
  { key: 'transport', label: 'Transport', color: '#cf4f3a' },
];

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Số năm cho ô chọn năm của biểu đồ doanh thu: năm nay và 2 năm trước.
const REVENUE_YEAR_COUNT = 3;

export const getRevenueYears = (now = new Date()) => {
  const current = now.getFullYear();
  return Array.from({ length: REVENUE_YEAR_COUNT }, (_, index) => current - index);
};

// Số dòng của bảng top phòng và top dịch vụ.
export const TOP_LIST_LIMIT = 5;

// Thứ tự các trạng thái đơn đặt phòng trong mục "Bookings by status".
export const BOOKING_STATUS_ORDER = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
