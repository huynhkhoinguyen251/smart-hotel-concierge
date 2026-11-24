import { addDays, isDateTimeLocal } from './dateHelpers.js';
import formatDate from './formatDate.js';

// Đọc và viết ngày trong ô chọn ngày, không cần dayjs (dùng khi DatePicker còn đang tải).

// Định dạng hiển thị: tháng bằng chữ để không nhầm ngày với tháng. Người dùng cũng gõ được dạng thứ hai.
export const DATE_DISPLAY = {
  date: ['D MMM YYYY', 'YYYY-MM-DD'],
  datetime: ['D MMM YYYY, HH:mm', 'YYYY-MM-DD HH:mm'],
};
export const DATE_PLACEHOLDERS = { date: 'Select date', datetime: 'Select date and time' };

// Màn hình cảm ứng: không mở bàn phím ảo, chỉ chọn trên lịch.
export const isTouchScreen = () => Boolean(globalThis.matchMedia?.('(pointer: coarse)').matches);

// "2027-07-10T14:30" thành "10 Jul 2027, 14:30", giống DatePicker.
export const toDateText = (value) => formatDate(value ?? '', { withTime: true });

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?$/;
const WORDS = /^(\d{1,2}) ([a-z]{3}) (\d{4})(?:,? (\d{2}:\d{2}))?$/i;

// Chữ người dùng gõ thành giá trị "YYYY-MM-DD" (hoặc "YYYY-MM-DDTHH:mm" khi withTime).
// Chưa đủ, sai hoặc ngoài khoảng min-max thì trả null.
export const parseDateText = (text, { withTime, min, max }) => {
  const trimmed = text.trim();
  const iso = trimmed.match(ISO);
  const words = trimmed.match(WORDS);
  let parts = null;
  if (iso) parts = { date: `${iso[1]}-${iso[2]}-${iso[3]}`, time: iso[4] };
  if (words && MONTHS.includes(words[2].toLowerCase())) {
    const month = String(MONTHS.indexOf(words[2].toLowerCase()) + 1).padStart(2, '0');
    parts = { date: `${words[3]}-${month}-${words[1].padStart(2, '0')}`, time: words[4] };
  }
  if (!parts || Boolean(parts.time) !== Boolean(withTime)) return null;
  const value = withTime ? `${parts.date}T${parts.time}` : parts.date;
  // addDays 0 ngày đổi ngày không có thật (31 Feb) thành ngày khác.
  if (addDays(parts.date, 0) !== parts.date || (withTime && !isDateTimeLocal(value))) return null;
  if ((min && value < min) || (max && value > max)) return null;
  return value;
};
