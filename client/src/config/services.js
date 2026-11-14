// 5 loại dịch vụ khách sạn (Mục 5 của proposal.md). Dịch vụ vận chuyển (motorbike_rental,
// airport_pickup, shuttle) không nằm ở đây; chúng thuộc trang Tours.
// unit: đơn vị số lượng (số ít, số nhiều); priceUnit: chữ hiện sau giá;
// bookingStatuses: trạng thái đơn đặt phòng cần có để đặt (backend kiểm tra lại).
export const HOTEL_SERVICE_CATEGORIES = {
  breakfast: {
    label: 'Breakfast',
    priceUnit: 'per person',
    unit: ['person', 'people'],
    bookingStatuses: ['confirmed', 'checked_in'],
  },
  buffet: {
    label: 'Dinner buffet',
    priceUnit: 'per person',
    unit: ['person', 'people'],
    bookingStatuses: ['confirmed', 'checked_in'],
  },
  massage: {
    label: 'Massage',
    priceUnit: 'per person',
    unit: ['person', 'people'],
    bookingStatuses: ['confirmed', 'checked_in'],
  },
  laundry: {
    label: 'Laundry',
    priceUnit: 'per kg',
    unit: ['kg', 'kg'],
    bookingStatuses: ['checked_in'],
  },
  housekeeping: {
    label: 'Housekeeping',
    priceUnit: 'per visit',
    unit: ['visit', 'visits'],
    bookingStatuses: ['checked_in'],
  },
};

export const HOTEL_SERVICE_CATEGORY_KEYS = Object.keys(HOTEL_SERVICE_CATEGORIES);

export const isHotelServiceCategory = (category) =>
  Object.hasOwn(HOTEL_SERVICE_CATEGORIES, category);

// Các tab lọc của trang dịch vụ: All + 5 loại.
export const SERVICE_CATEGORY_TABS = [
  { value: '', label: 'All' },
  ...HOTEL_SERVICE_CATEGORY_KEYS.map((key) => ({
    value: key,
    label: HOTEL_SERVICE_CATEGORIES[key].label,
  })),
];

// Đơn đặt phòng ở các trạng thái này mới đặt được ít nhất một dịch vụ.
export const SERVICE_ELIGIBLE_BOOKING_STATUSES = ['confirmed', 'checked_in'];

// Giới hạn giống backend (config/services.js và noteRule).
export const MIN_SERVICE_QUANTITY = 1;
export const MAX_SERVICE_QUANTITY = 20;
export const SERVICE_NOTE_MAX_LENGTH = 1000;
// Giờ kết thúc thời gian lưu trú trong ngày check-out.
export const STAY_END_TIME = '23:59';

export const SERVICE_REQUEST_CREATED_MESSAGE =
  'Your request has been sent. The hotel will confirm it soon.';
export const ADMIN_SERVICE_NOTE = 'Admin accounts cannot book services.';
