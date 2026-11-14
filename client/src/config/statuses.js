// Nhãn và màu của các trạng thái, dùng cho StatusBadge.
// Module sau (dịch vụ, đồ ăn, tour, hỗ trợ) chỉ cần thêm trạng thái mới vào đây.
// tone là một khóa trong TONE_CLASSES của StatusBadge.
export const STATUS_CONFIG = {
  pending: { label: 'Pending', tone: 'amber' },
  confirmed: { label: 'Confirmed', tone: 'sky' },
  checked_in: { label: 'Checked in', tone: 'teal' },
  checked_out: { label: 'Checked out', tone: 'slate' },
  // Yêu cầu dịch vụ: pending → confirmed → in_progress → completed.
  in_progress: { label: 'In progress', tone: 'violet' },
  // Đơn đồ ăn: pending → confirmed → preparing → delivering → completed.
  preparing: { label: 'Preparing', tone: 'violet' },
  delivering: { label: 'Delivering', tone: 'teal' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

const toTabs = (statuses) => [
  { value: '', label: 'All' },
  ...statuses.map((status) => ({ value: status, label: STATUS_CONFIG[status].label })),
];

// Trạng thái lạ: "in_progress" thành "In progress", màu xám.
export const getStatusConfig = (status) => {
  if (STATUS_CONFIG[status]) {
    return STATUS_CONFIG[status];
  }
  const text = String(status ?? '').replace(/_/g, ' ');
  return { label: text.charAt(0).toUpperCase() + text.slice(1), tone: 'slate' };
};

// Các tab lọc của trang "My bookings", theo đúng luồng trạng thái trong proposal.
export const BOOKING_STATUS_TABS = toTabs([
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]);

// Đơn đặt phòng còn hủy hoặc đổi được ở phía khách.
export const CANCELLABLE_BOOKING_STATUSES = ['pending', 'confirmed'];
export const EDITABLE_BOOKING_STATUS = 'pending';

// Các tab lọc của trang "My service requests".
export const SERVICE_REQUEST_STATUS_TABS = toTabs([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
]);

// Khách chỉ tự hủy được yêu cầu dịch vụ còn pending.
export const CANCELLABLE_SERVICE_REQUEST_STATUS = 'pending';

// Các tab lọc của trang "My food orders".
export const FOOD_ORDER_STATUS_TABS = toTabs([
  'pending',
  'confirmed',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
]);

// Khách chỉ tự hủy được đơn đồ ăn còn pending.
export const CANCELLABLE_FOOD_ORDER_STATUS = 'pending';
