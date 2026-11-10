// Hằng số nghiệp vụ của dịch vụ khách sạn, theo Mục 5 của proposal.md.

// 8 giá trị ENUM của cột services.category trong database/schema.sql.
export const SERVICE_CATEGORIES = [
  'breakfast',
  'buffet',
  'massage',
  'laundry',
  'housekeeping',
  'motorbike_rental',
  'airport_pickup',
  'shuttle',
];

// Dịch vụ khách sạn đặt qua /api/service-bookings, và trạng thái đơn đặt phòng cần có để đặt.
// Các loại còn lại (thuê xe máy, đón sân bay, xe đưa đón) đặt qua API du lịch.
export const HOTEL_SERVICE_BOOKING_STATUSES = {
  breakfast: ['confirmed', 'checked_in'],
  buffet: ['confirmed', 'checked_in'],
  massage: ['confirmed', 'checked_in'],
  laundry: ['checked_in'],
  housekeeping: ['checked_in'],
};

export const SERVICE_REQUEST_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

// Luồng trạng thái của yêu cầu dịch vụ. Admin hủy được khi còn pending hoặc confirmed.
export const SERVICE_REQUEST_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
};

// User chỉ tự hủy được yêu cầu còn ở trạng thái này.
export const USER_CANCELLABLE_SERVICE_STATUS = 'pending';

// Số lượng của một yêu cầu dịch vụ.
export const MIN_SERVICE_QUANTITY = 1;
export const MAX_SERVICE_QUANTITY = 20;

// Yêu cầu dịch vụ phải nằm trong thời gian lưu trú: từ giờ nhận phòng ngày check-in
// (CHECK_IN_HOUR trong config/booking.js) đến hết ngày check-out, tức 23:59.
export const STAY_END_HOUR = 23;
export const STAY_END_MINUTE = 59;
