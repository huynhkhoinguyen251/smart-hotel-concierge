import formatDate from './formatDate.js';
import { addDays, isDateString } from './dateHelpers.js';

// Giờ nhận phòng 14:00; khách tự hủy online được tới 24 giờ trước giờ đó,
// tức 14:00 ngày trước ngày check-in. Khớp với server/src/config/booking.js.
export const CHECK_IN_TIME = '14:00';
const CHECK_IN_HOUR = 14;

// Hạn hủy miễn phí theo đồng hồ của máy người dùng, chỉ để hiển thị.
// Backend mới là nơi quyết định; lỗi thì hiện thông báo của backend.
// Trả { label: "5 Dec 2026, 14:00", passed } hoặc null nếu ngày không hợp lệ.
export const getFreeCancellationDeadline = (checkIn, now = new Date()) => {
  if (!isDateString(checkIn)) {
    return null;
  }
  const dayBefore = addDays(checkIn, -1);
  const [year, month, day] = dayBefore.split('-').map(Number);
  const deadline = new Date(year, month - 1, day, CHECK_IN_HOUR, 0, 0);

  return {
    label: formatDate(`${dayBefore} ${CHECK_IN_TIME}`, { withTime: true }),
    passed: now.getTime() > deadline.getTime(),
  };
};
