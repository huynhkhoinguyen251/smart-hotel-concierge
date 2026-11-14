import { getStatusConfig } from '../config/statuses.js';
import { HOTEL_SERVICE_CATEGORIES, STAY_END_TIME } from '../config/services.js';
import { CHECK_IN_TIME } from './cancellation.js';
import { formatDateRange } from './formatDate.js';

const pad = (value) => String(value).padStart(2, '0');
// Giá trị của ô datetime-local: "YYYY-MM-DDTHH:mm".
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// Cấu hình của một loại dịch vụ; loại lạ (ví dụ dịch vụ vận chuyển) thì trả null.
export const getServiceCategory = (category) => HOTEL_SERVICE_CATEGORIES[category] ?? null;

export const getCategoryLabel = (category) =>
  getServiceCategory(category)?.label ?? getStatusConfig(category).label;

// "150,000 VND" + "per person". Loại lạ thì không có đơn vị.
export const getPriceUnit = (category) => getServiceCategory(category)?.priceUnit ?? '';

// formatQuantity(2, 'breakfast') = "2 people"; formatQuantity(1, 'laundry') = "1 kg".
export const formatQuantity = (quantity, category) => {
  const unit = getServiceCategory(category)?.unit;
  if (!unit) return String(quantity);
  return `${quantity} ${Number(quantity) === 1 ? unit[0] : unit[1]}`;
};

// Nhãn của một đơn đặt phòng trong ô chọn: "Room 302 · 28 Dec - 31 Dec 2026 · Checked in".
export const getBookingOptionLabel = (booking) =>
  `Room ${booking.room.room_number} · ${formatDateRange(booking.check_in, booking.check_out)} · ${getStatusConfig(booking.status).label}`;

// Date thành "YYYY-MM-DDTHH:mm" theo giờ của máy người dùng (không dùng toISOString, vì đổi sang UTC).
export const toDateTimeLocal = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Khoảng thời gian được chọn cho một đơn: từ 14:00 ngày check-in (hoặc phút kế tiếp nếu đã qua)
// đến 23:59 ngày check-out. Các chuỗi cùng dạng nên so sánh trực tiếp được.
// Thời gian lưu trú đã kết thúc thì trả null.
export const getScheduleLimits = (booking, now = new Date()) => {
  const stayStart = `${booking.check_in}T${CHECK_IN_TIME}`;
  const max = `${booking.check_out}T${STAY_END_TIME}`;
  const nextMinute = toDateTimeLocal(new Date(now.getTime() + 60000));
  const min = nextMinute > stayStart ? nextMinute : stayStart;
  return min <= max ? { min, max, stayStart } : null;
};

// Đơn dùng được cho loại dịch vụ này: đúng trạng thái và còn thời gian lưu trú. Ngày nhận sớm trước.
export const getEligibleBookings = (bookings, category, now = new Date()) => {
  const statuses = getServiceCategory(category)?.bookingStatuses ?? [];
  return bookings
    .filter((booking) => statuses.includes(booking.status) && getScheduleLimits(booking, now))
    .sort((a, b) => (a.check_in < b.check_in ? -1 : a.check_in > b.check_in ? 1 : a.id - b.id));
};

// Lỗi của ô ngày giờ, hoặc '' nếu hợp lệ. Backend vẫn kiểm tra lại.
export const getScheduleError = (value, limits) => {
  if (!value) return 'Choose a date and time';
  if (!DATETIME_LOCAL_PATTERN.test(value)) return 'Choose a valid date and time';
  if (!limits) return 'This stay has already ended';
  if (value < limits.min || value > limits.max) {
    return limits.min > limits.stayStart
      ? 'Choose a future time within your stay'
      : 'Choose a time within your stay';
  }
  return '';
};

// "2026-12-28T09:30" thành "2026-12-28 09:30" như backend yêu cầu.
export const toApiDateTime = (value) => value.replace('T', ' ');
