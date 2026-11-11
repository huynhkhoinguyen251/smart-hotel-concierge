// Hằng số của thống kê cho admin, theo mục 9 của docs/api.md.

// Số dòng của top phòng và top dịch vụ.
export const DEFAULT_TOP_LIMIT = 5;
export const MAX_TOP_LIMIT = 20;

// Khoảng năm hợp lệ của thống kê doanh thu theo tháng.
export const MIN_STATS_YEAR = 2000;
export const MAX_STATS_YEAR = 2100;

export const MONTHS_PER_YEAR = 12;

// Các nguồn doanh thu, theo thứ tự trả về. Mỗi khoản tính vào tháng của ngày sử dụng.
// table: bảng; usedAt: cột ngày sử dụng; doneStatus: trạng thái được tính doanh thu.
export const REVENUE_SOURCES = [
  { key: 'rooms', table: 'bookings', usedAt: 'check_out', doneStatus: 'checked_out' },
  { key: 'services', table: 'service_bookings', usedAt: 'scheduled_at', doneStatus: 'completed' },
  { key: 'food', table: 'food_orders', usedAt: 'created_at', doneStatus: 'completed' },
  { key: 'tours', table: 'tour_bookings', usedAt: 'tour_date', doneStatus: 'completed' },
  { key: 'transport', table: 'transport_bookings', usedAt: 'start_at', doneStatus: 'completed' },
];

// Đơn ở trạng thái này không được tính vào số lượt đặt và số lượt dùng.
export const EXCLUDED_USAGE_STATUS = 'cancelled';
