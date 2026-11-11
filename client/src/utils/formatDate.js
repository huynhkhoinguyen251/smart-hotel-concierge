const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Backend trả ngày dạng chuỗi theo giờ Việt Nam: "2026-12-06" hoặc "2026-12-06 14:00:00".
// Tách chuỗi trực tiếp, không qua new Date(), để không bị lệch ngày theo múi giờ của trình duyệt.
const PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/;

// "2026-12-06" thành "6 Dec 2026"; withTime: "2026-12-06 14:00:00" thành "6 Dec 2026, 14:00".
export default function formatDate(value, { withTime = false } = {}) {
  const match = typeof value === 'string' ? value.match(PATTERN) : null;
  if (!match) {
    return '';
  }

  const [, year, month, day, hour, minute] = match;
  const date = `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
  return withTime && hour ? `${date}, ${hour}:${minute}` : date;
}
