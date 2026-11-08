// Ngày dạng 'YYYY-MM-DD'. Mọi phép tính ở đây không phụ thuộc múi giờ của chuỗi ngày.

const pad = (number) => String(number).padStart(2, '0');

// Ngày hôm nay theo giờ địa phương của server. Không dùng toISOString(),
// vì hàm đó dùng giờ UTC nên có thể lệch một ngày.
export const formatLocalDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toUtcTime = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

// Đúng dạng YYYY-MM-DD và là ngày có thật, ví dụ 2026-02-30 là sai.
export const isValidDateString = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(toUtcTime(value));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const countNights = (checkIn, checkOut) =>
  Math.round((toUtcTime(checkOut) - toUtcTime(checkIn)) / MS_PER_DAY);

// Cộng thêm số ngày vào một ngày 'YYYY-MM-DD', ví dụ addDays('2026-12-31', 1) = '2027-01-01'.
export const addDays = (value, days) => {
  const date = new Date(toUtcTime(value) + days * MS_PER_DAY);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

// Thời điểm theo giờ địa phương của server, ví dụ 14:00 ngày nhận phòng.
export const toLocalDateTime = (value, hour) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, hour, 0, 0, 0);
};
