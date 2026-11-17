import {
  FLIGHT_NUMBER_MAX_LENGTH,
  FLIGHT_NUMBER_PATTERN,
  HOURS_PER_RENTAL_DAY,
  LOCATION_MAX_LENGTH,
  MAX_ADVANCE_DAYS,
  MAX_PARTICIPANTS,
  MAX_RENTAL_DAYS,
  MIN_PARTICIPANTS,
  TRANSPORT_CATEGORIES,
} from '../config/tourism.js';
import {
  addDays,
  isDateString,
  isDateTimeLocal,
  parseLocalDateTime,
  toApiDateTime,
  toDateString,
  toDateTimeLocal,
} from './dateHelpers.js';
import { multiplyPrice } from './foodCart.js';

// Các hàm thuần (không React) cho trang tour và vận chuyển. now truyền vào được để dễ kiểm thử.
// Đây chỉ là kiểm tra ở trình duyệt; backend vẫn kiểm tra lại mọi thứ.

const MS_PER_RENTAL_DAY = HOURS_PER_RENTAL_DAY * 60 * 60 * 1000;

// ---------- Loại vận chuyển ----------

// Cấu hình của một loại vận chuyển; loại lạ (ví dụ dịch vụ khách sạn) thì trả null.
export const getTransportCategory = (category) => TRANSPORT_CATEGORIES[category] ?? null;

export const getTransportLabel = (category) => getTransportCategory(category)?.label ?? category;

// "2 cars", "1 person". Thuê xe máy không có số lượng nên trả ''.
export const formatTransportQuantity = (quantity, category) => {
  const unit = getTransportCategory(category)?.quantity?.unit;
  if (!unit) return '';
  return `${quantity} ${Number(quantity) === 1 ? unit[0] : unit[1]}`;
};

export const formatParticipants = (count) =>
  `${count} ${Number(count) === 1 ? 'person' : 'people'}`;

export const formatDays = (days) => `${days} ${days === 1 ? 'day' : 'days'}`;

// ---------- Giá ----------

// Số ngày thuê xe máy: mỗi 24 giờ bắt đầu tính là 1 ngày (làm tròn lên).
// Nhận "YYYY-MM-DDTHH:mm" hoặc "YYYY-MM-DD HH:mm:ss". Sai dạng hoặc trả xe không sau lúc nhận thì 0.
export const getRentalDays = (startAt, endAt) => {
  const start = parseLocalDateTime(startAt);
  const end = parseLocalDateTime(endAt);
  if (!start || !end || end <= start) return 0;
  return Math.ceil((end - start) / MS_PER_RENTAL_DAY);
};

export const estimateTourTotal = (price, participants) => multiplyPrice(price, participants);

// Tổng tiền dự kiến của một yêu cầu vận chuyển, hoặc null khi chưa tính được
// (thuê xe máy chưa chọn đủ giờ hoặc quá 30 ngày).
export const estimateTransportTotal = (service, form) => {
  if (service.category === 'motorbike_rental') {
    const days = getRentalDays(form.start_at, form.end_at);
    return days >= 1 && days <= MAX_RENTAL_DAYS ? multiplyPrice(service.price, days) : null;
  }
  return multiplyPrice(service.price, Number(form.quantity) || 0);
};

// ---------- Giới hạn ngày giờ ----------

// Ngày tour: từ ngày mai đến hôm nay + 365 ngày (chuỗi "YYYY-MM-DD", không dùng toISOString).
export const getTourDateLimits = (now = new Date()) => {
  const today = toDateString(now);
  return { min: addDays(today, 1), max: addDays(today, MAX_ADVANCE_DAYS) };
};

// Giờ bắt đầu vận chuyển: từ phút kế tiếp đến hết ngày thứ 365 (giá trị của ô datetime-local).
export const getStartTimeLimits = (now = new Date()) => ({
  min: toDateTimeLocal(new Date(now.getTime() + 60000)),
  max: `${addDays(toDateString(now), MAX_ADVANCE_DAYS)}T23:59`,
});

// ---------- Kiểm tra form ----------

// Trả { tên ô: lỗi }; object rỗng nghĩa là hợp lệ.
export const validateTourBooking = ({ tour_date, participants }, now = new Date()) => {
  const errors = {};
  const limits = getTourDateLimits(now);
  if (!tour_date) {
    errors.tour_date = 'Choose a tour date';
  } else if (!isDateString(tour_date)) {
    errors.tour_date = 'Choose a valid date';
  } else if (tour_date < limits.min) {
    errors.tour_date = 'The tour date must be after today';
  } else if (tour_date > limits.max) {
    errors.tour_date = `The tour date cannot be more than ${MAX_ADVANCE_DAYS} days from today`;
  }

  const count = Number(participants);
  if (!Number.isInteger(count) || count < MIN_PARTICIPANTS || count > MAX_PARTICIPANTS) {
    errors.participants = `Choose from ${MIN_PARTICIPANTS} to ${MAX_PARTICIPANTS} people`;
  }
  return errors;
};

const locationError = (value, label) => {
  const text = value.trim();
  if (!text) return `Enter the ${label.toLowerCase()}`;
  if (text.length > LOCATION_MAX_LENGTH) return `Use at most ${LOCATION_MAX_LENGTH} characters`;
  return '';
};

// Kiểm tra form vận chuyển theo đúng loại. Trả { tên ô: lỗi }; object rỗng nghĩa là hợp lệ.
export const validateTransportBooking = (category, form, now = new Date()) => {
  const config = getTransportCategory(category);
  const errors = {};
  if (!config) return errors;

  const limits = getStartTimeLimits(now);
  if (!form.start_at) {
    errors.start_at = 'Choose a date and time';
  } else if (!isDateTimeLocal(form.start_at)) {
    errors.start_at = 'Choose a valid date and time';
  } else if (form.start_at < limits.min) {
    errors.start_at = 'Choose a time in the future';
  } else if (form.start_at > limits.max) {
    errors.start_at = `The time cannot be more than ${MAX_ADVANCE_DAYS} days from today`;
  }

  if (category === 'motorbike_rental') {
    if (!form.end_at) {
      errors.end_at = 'Choose a return time';
    } else if (!isDateTimeLocal(form.end_at)) {
      errors.end_at = 'Choose a valid date and time';
    } else if (isDateTimeLocal(form.start_at)) {
      const days = getRentalDays(form.start_at, form.end_at);
      if (days === 0) errors.end_at = 'The return time must be after the pick-up time';
      else if (days > MAX_RENTAL_DAYS) errors.end_at = `A rental can be at most ${MAX_RENTAL_DAYS} days`;
    }
  }

  const pickupError = locationError(form.pickup_location, config.fields.pickup);
  if (pickupError) errors.pickup_location = pickupError;
  const dropoffError = locationError(form.dropoff_location, config.fields.dropoff);
  if (dropoffError) errors.dropoff_location = dropoffError;

  if (category === 'airport_pickup') {
    const flight = form.flight_number.trim();
    if (!flight) errors.flight_number = 'Enter your flight number';
    else if (flight.length > FLIGHT_NUMBER_MAX_LENGTH) {
      errors.flight_number = `Use at most ${FLIGHT_NUMBER_MAX_LENGTH} characters`;
    } else if (!FLIGHT_NUMBER_PATTERN.test(flight)) {
      errors.flight_number = 'Use only letters, digits and spaces';
    }
  }

  if (config.quantity) {
    const quantity = Number(form.quantity);
    const { min, max, label } = config.quantity;
    if (!Number.isInteger(quantity) || quantity < min || quantity > max) {
      errors.quantity = `${label} must be from ${min} to ${max}`;
    }
  }
  return errors;
};

// Dữ liệu gửi lên POST /transport-bookings: chỉ các trường loại đó cho phép.
// Thuê xe máy: có end_at, quantity luôn 1, không có flight_number.
// Đón sân bay: có flight_number, không có end_at. Xe đưa đón: không có end_at và flight_number.
export const buildTransportPayload = (service, form) => {
  const note = form.note.trim();
  const payload = {
    service_id: service.id,
    start_at: toApiDateTime(form.start_at),
    pickup_location: form.pickup_location.trim(),
    dropoff_location: form.dropoff_location.trim(),
  };
  if (service.category === 'motorbike_rental') {
    payload.end_at = toApiDateTime(form.end_at);
    payload.quantity = 1;
  } else {
    payload.quantity = Number(form.quantity);
  }
  if (service.category === 'airport_pickup') {
    payload.flight_number = form.flight_number.trim().toUpperCase();
  }
  if (note) payload.note = note;
  return payload;
};

// Giá trị ban đầu của form vận chuyển (đón sân bay có sẵn điểm đón và điểm trả).
export const getInitialTransportForm = (category) => {
  const config = getTransportCategory(category);
  return {
    start_at: '',
    end_at: '',
    pickup_location: config?.defaults?.pickup_location ?? '',
    dropoff_location: config?.defaults?.dropoff_location ?? '',
    flight_number: '',
    quantity: config?.quantity?.min ?? 1,
    note: '',
  };
};
