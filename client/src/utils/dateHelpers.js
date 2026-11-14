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

// addDays('2026-12-31', 1) = '2027-01-01'. Chuỗi không hợp lệ thì trả ''.
export const addDays = (dateString, days) => {
  if (!isDateString(dateString)) {
    return '';
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return toDateString(new Date(year, month - 1, day + days));
};
