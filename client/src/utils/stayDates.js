import { addDays, getToday, isDateString } from './dateHelpers.js';

// Kiểm tra ngày nhận và trả phòng ở trình duyệt, trước khi gọi API.
// required: bắt buộc chọn cả hai ngày. Không bắt buộc thì được để trống cả hai.
// Trả chuỗi lỗi, hoặc '' nếu hợp lệ. Backend vẫn kiểm tra lại (tối đa 30 đêm, 365 ngày...).
export const getStayDatesError = ({ check_in, check_out }, { required = false } = {}) => {
  if (!check_in && !check_out) {
    return required ? 'Choose check-in and check-out dates' : '';
  }
  if (!check_in || !check_out) {
    return required
      ? 'Choose check-in and check-out dates'
      : 'Choose both check-in and check-out dates, or leave both empty';
  }
  if (!isDateString(check_in) || !isDateString(check_out)) {
    return 'Dates must be valid';
  }
  // So sánh chuỗi "YYYY-MM-DD" cho kết quả đúng như so sánh ngày.
  if (check_in < getToday()) {
    return 'Check-in date cannot be in the past';
  }
  if (check_out <= check_in) {
    return 'Check-out must be after check-in';
  }
  return '';
};

// Lỗi chỉ về thứ tự ngày, dùng để báo ngay khi người dùng đang chọn.
export const getStayOrderError = ({ check_in, check_out }) =>
  check_in && check_out && check_out <= check_in ? 'Check-out must be after check-in' : '';

// Giá trị min cho hai ô ngày: không chọn ngày quá khứ, trả phòng sau nhận phòng ít nhất 1 ngày.
export const getStayDateLimits = (checkIn) => {
  const today = getToday();
  return {
    checkInMin: today,
    checkOutMin: addDays(checkIn && checkIn >= today ? checkIn : today, 1),
  };
};

// Số khách từ 1 đến max, dạng options cho Select.
export const guestOptions = (max = 10) =>
  Array.from({ length: max }, (_, index) => {
    const count = index + 1;
    return { value: String(count), label: `${count} ${count === 1 ? 'guest' : 'guests'}` };
  });
