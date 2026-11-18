// Thống kê cho admin (mục 9 của docs/api.md). Thẻ số liệu và biểu đồ dùng chung tên và màu ở đây.

// 5 nguồn doanh thu, theo đúng thứ tự backend trả (server/src/config/stats.js).
export const REVENUE_SOURCES = [
  { key: 'rooms', label: 'Rooms', color: '#0f766e' },
  { key: 'services', label: 'Services', color: '#0ea5e9' },
  { key: 'food', label: 'Food', color: '#f59e0b' },
  { key: 'tours', label: 'Tours', color: '#8b5cf6' },
  { key: 'transport', label: 'Transport', color: '#f43f5e' },
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
