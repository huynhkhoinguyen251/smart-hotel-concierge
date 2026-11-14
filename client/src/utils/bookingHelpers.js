// Số khách từ địa chỉ trang hoặc form, giới hạn trong 1..capacity, trả về chuỗi cho Select.
export const clampGuests = (value, capacity) => {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1) return '1';
  return String(Math.min(count, capacity));
};

// Hai khoảng ngày trùng nhau khi a.check_in < b.check_out và a.check_out > b.check_in
// (giống quy tắc ở backend). Chuỗi "YYYY-MM-DD" so sánh được trực tiếp.
export const staysOverlap = (a, b) => a.check_in < b.check_out && a.check_out > b.check_in;

export const BOOKING_CREATED_MESSAGE = 'Your booking is pending confirmation by the hotel.';

// Tài khoản admin không được đặt phòng (backend trả 403), nên giao diện ẩn nút đặt.
export const ADMIN_BOOKING_NOTE = 'Admin accounts cannot book rooms.';
