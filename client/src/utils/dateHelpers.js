// Ngày dạng "YYYY-MM-DD" theo giờ của máy người dùng.
// Không dùng toISOString(), vì hàm đó đổi sang giờ UTC và có thể lùi một ngày.
const pad = (value) => String(value).padStart(2, '0');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getToday = () => toDateString(new Date());

export const isDateString = (value) => typeof value === 'string' && DATE_PATTERN.test(value);

// Số đêm giữa hai ngày "YYYY-MM-DD"; dùng Date.UTC nên không bị ảnh hưởng bởi giờ mùa hè.
// Ngày không hợp lệ thì trả 0.
export const countNights = (checkIn, checkOut) => {
  if (!isDateString(checkIn) || !isDateString(checkOut)) {
    return 0;
  }
  const toUtc = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.max(0, Math.round((toUtc(checkOut) - toUtc(checkIn)) / 86400000));
};

// Date thành "YYYY-MM-DDTHH:mm" (giá trị của ô datetime-local) theo giờ của máy người dùng.
export const toDateTimeLocal = (date) =>
  `${toDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

// "2026-12-28T09:30" thành "2026-12-28 09:30" như backend yêu cầu.
export const toApiDateTime = (value) => value.replace('T', ' ');

// Ô datetime-local: đúng dạng "YYYY-MM-DDTHH:mm".
export const isDateTimeLocal = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);

// "2026-12-28T09:30" hoặc "2026-12-28 09:30:00" thành Date theo giờ của máy; sai dạng thì null.
export const parseLocalDateTime = (value) => {
  const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute] = match.map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

// addDays('2026-12-31', 1) = '2027-01-01'. Chuỗi không hợp lệ thì trả ''.
export const addDays = (dateString, days) => {
  if (!isDateString(dateString)) {
    return '';
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return toDateString(new Date(year, month - 1, day + days));
};
