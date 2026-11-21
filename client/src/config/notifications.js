// Thông báo trong ứng dụng (mục 10 của docs/api.md).

// Tải lại số chưa đọc mỗi 60 giây khi tab đang mở.
export const UNREAD_POLL_MS = 60 * 1000;
// Số thông báo trong khung thả xuống của chuông.
export const BELL_PREVIEW_LIMIT = 5;
export const NOTIFICATIONS_PAGE_SIZE = 10;

// Nhãn và màu theo type (backend: booking, service, food_order, tour, transport, payment, support).
export const NOTIFICATION_TYPES = {
  booking: { label: 'Booking', className: 'bg-teal-50 text-teal-800' },
  service: { label: 'Service', className: 'bg-sky-50 text-sky-800' },
  food_order: { label: 'Food', className: 'bg-amber-50 text-amber-800' },
  tour: { label: 'Tour', className: 'bg-emerald-50 text-emerald-800' },
  transport: { label: 'Transport', className: 'bg-violet-50 text-violet-800' },
  payment: { label: 'Payment', className: 'bg-emerald-50 text-emerald-800' },
  support: { label: 'Support', className: 'bg-slate-100 text-slate-700' },
};

export const getNotificationType = (type) =>
  NOTIFICATION_TYPES[type] ?? { label: 'Notice', className: 'bg-slate-100 text-slate-700' };

export const NOTIFICATION_TABS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Unread' },
];

// Badge đỏ trên chuông: quá 9 thì hiện "9+".
export const formatUnreadBadge = (count) => (count > 9 ? '9+' : String(count));
