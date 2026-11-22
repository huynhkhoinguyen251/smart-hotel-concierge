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
export const toLocalDateTime = (value, hour, minute = 0) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})$/;

// Đúng dạng 'YYYY-MM-DD HH:mm', ngày có thật, giờ 00-23 và phút 00-59.
export const isValidDateTimeString = (value) => {
  const match = typeof value === 'string' && value.match(DATE_TIME_PATTERN);
  return Boolean(
    match && isValidDateString(match[1]) && Number(match[2]) <= 23 && Number(match[3]) <= 59,
  );
};

// Đổi 'YYYY-MM-DD HH:mm' (đã kiểm tra bằng isValidDateTimeString) thành Date theo giờ địa phương.
export const parseLocalDateTime = (value) => {
  const [, date, hour, minute] = value.match(DATE_TIME_PATTERN);
  return toLocalDateTime(date, Number(hour), Number(minute));
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Ngày dễ đọc cho thông báo: '2026-12-24' thành '24 Dec 2026'; có giờ ('2026-12-24 18:30:00')
// thì thành '24 Dec 2026, 18:30'. Giá trị lạ thì trả lại nguyên chuỗi.
export const formatDisplayDate = (value) => {
  const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?/);
  if (!match) {
    return String(value ?? '');
  }
  const [, year, month, day, hour, minute] = match;
  const date = `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
  return hour ? `${date}, ${hour}:${minute}` : date;
};

const DATE_TIME_SECONDS_PATTERN = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

// Cộng số phút vào chuỗi 'YYYY-MM-DD HH:mm:ss' (giờ địa phương do database trả về) và trả
// cùng dạng. Tính trên giờ UTC "giả" nên không phụ thuộc múi giờ của server.
export const addMinutesToDateTime = (value, minutes) => {
  const match = typeof value === 'string' && value.match(DATE_TIME_SECONDS_PATTERN);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute, second] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes, second));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

// Đúng dạng 'YYYY-MM-DD HH:mm:ss', ngày có thật, giờ 00-23, phút và giây 00-59.
export const isValidDateTimeSecondsString = (value) => {
  const match = typeof value === 'string' && value.match(DATE_TIME_SECONDS_PATTERN);
  return Boolean(
    match &&
      isValidDateString(`${match[1]}-${match[2]}-${match[3]}`) &&
      Number(match[4]) <= 23 &&
      Number(match[5]) <= 59 &&
      Number(match[6]) <= 59,
  );
};
