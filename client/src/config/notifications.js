// Thông báo trong ứng dụng (mục 10 của docs/api.md).

// Tải lại số chưa đọc mỗi 60 giây khi tab đang mở.
export const UNREAD_POLL_MS = 60 * 1000;
// Số thông báo trong khung thả xuống của chuông.
export const BELL_PREVIEW_LIMIT = 5;
export const NOTIFICATIONS_PAGE_SIZE = 10;

// Nhãn theo type (backend: booking, service, food_order, tour, transport, payment, support).
const NOTIFICATION_LABELS = {
  booking: 'Booking',
  service: 'Service',
  food_order: 'Food',
  tour: 'Tour',
  transport: 'Transport',
  payment: 'Payment',
  support: 'Support',
};

export const getNotificationLabel = (type) => NOTIFICATION_LABELS[type] ?? 'Notice';

export const NOTIFICATION_TABS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Unread' },
];

// Badge đỏ trên chuông: quá 9 thì hiện "9+".
export const formatUnreadBadge = (count) => (count > 9 ? '9+' : String(count));
