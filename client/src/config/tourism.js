// Du lịch: tour địa phương và vận chuyển (Mục 5 của proposal.md, mục 6 của docs/api.md).
// Giới hạn giống backend (server/src/config/tourism.js); backend vẫn kiểm tra lại.

// 3 loại vận chuyển, đặt qua POST /transport-bookings.
// quantity: null = không có ô số lượng (thuê xe máy luôn 1 xe); unit: đơn vị (số ít, số nhiều).
// Các nhãn ô của form khác nhau theo loại.
export const TRANSPORT_CATEGORIES = {
  motorbike_rental: {
    label: 'Motorbike rental',
    pricing: 'Charged per bike for every started 24 hours, from 1 to 30 days.',
    priceUnit: 'per bike per day',
    quantity: null,
    fields: {
      start: 'Pick-up time',
      end: 'Return time',
      pickup: 'Pick-up location',
      dropoff: 'Return location',
    },
  },
  airport_pickup: {
    label: 'Airport pickup',
    pricing: 'Charged per car, from 1 to 5 cars. A flight number is required.',
    priceUnit: 'per car',
    quantity: { label: 'Number of cars', min: 1, max: 5, unit: ['car', 'cars'] },
    fields: {
      start: 'Pickup time (arrival)',
      pickup: 'Pickup location',
      dropoff: 'Drop-off location',
    },
    defaults: {
      pickup_location: 'Da Nang International Airport',
      dropoff_location: 'Smart Hotel Concierge',
    },
  },
  shuttle: {
    label: 'Shuttle',
    pricing: 'Charged per person, from 1 to 20 people.',
    priceUnit: 'per person',
    quantity: { label: 'Number of people', min: 1, max: 20, unit: ['person', 'people'] },
    fields: {
      start: 'Pickup time',
      pickup: 'Pickup location',
      dropoff: 'Drop-off location',
    },
  },
};

export const TRANSPORT_CATEGORY_KEYS = Object.keys(TRANSPORT_CATEGORIES);

export const isTransportCategory = (category) => Object.hasOwn(TRANSPORT_CATEGORIES, category);

// Tour: tính theo người, 1–20 người.
export const MIN_PARTICIPANTS = 1;
export const MAX_PARTICIPANTS = 20;

export const MAX_RENTAL_DAYS = 30;
export const HOURS_PER_RENTAL_DAY = 24;
// Ngày tour và giờ bắt đầu vận chuyển: ở tương lai và không quá 365 ngày.
export const MAX_ADVANCE_DAYS = 365;

export const FLIGHT_NUMBER_PATTERN = /^[A-Za-z0-9 ]+$/;
export const FLIGHT_NUMBER_MAX_LENGTH = 20;
export const LOCATION_MAX_LENGTH = 255;
// Giống noteRule của backend.
export const TOURISM_NOTE_MAX_LENGTH = 1000;

// Các tab của trang Tours và trang My trips.
export const TOURS_PAGE_TABS = [
  { value: '', label: 'Local tours' },
  { value: 'transport', label: 'Transport' },
];
export const TRIP_TYPE_TABS = [
  { value: '', label: 'Tours' },
  { value: 'transport', label: 'Transport' },
];

export const TOUR_BOOKING_CREATED_MESSAGE =
  'Your tour booking has been sent. The hotel will confirm it soon.';
export const TRANSPORT_BOOKING_CREATED_MESSAGE =
  'Your request has been sent. The hotel will confirm it soon.';
export const TOUR_BOOKING_CANCELLED_MESSAGE = 'Your tour booking has been cancelled.';
export const TRANSPORT_BOOKING_CANCELLED_MESSAGE = 'Your transport request has been cancelled.';
export const ADMIN_TOUR_NOTE = 'Admin accounts cannot book tours.';
export const ADMIN_TRANSPORT_NOTE = 'Admin accounts cannot book transport.';
export const PLATE_PENDING_NOTE = 'Given when the hotel approves your request';
