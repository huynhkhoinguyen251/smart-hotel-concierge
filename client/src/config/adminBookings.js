// Quản lý đơn đặt phòng (admin), theo luồng trạng thái ở Mục 5 của proposal.md.

// Các bước của đơn đặt phòng; cancelled hiện riêng.
export const BOOKING_STEPS = ['pending', 'confirmed', 'checked_in', 'checked_out'];

const SERVICES_NOTE =
  'Pending and confirmed service requests of this booking will also be cancelled.';

// Các thao tác admin được làm ở từng trạng thái (giống ALLOWED_TRANSITIONS của backend).
// status: trạng thái mới gửi lên; variant: kiểu nút; title/message: nội dung hộp thoại xác nhận.
const ACTIONS = {
  confirm: {
    status: 'confirmed',
    label: 'Confirm',
    variant: 'primary',
    title: 'Confirm this booking?',
    message: 'The guest will see the booking as confirmed.',
    success: 'The booking has been confirmed.',
  },
  checkIn: {
    status: 'checked_in',
    label: 'Check in',
    variant: 'primary',
    title: 'Check in this guest?',
    message: 'The guest can then order food and use services that need a checked-in stay.',
    success: 'The guest has been checked in.',
  },
  checkOut: {
    status: 'checked_out',
    label: 'Check out',
    variant: 'primary',
    title: 'Check out this guest?',
    message: 'The stay will count as revenue, and the guest can review the room.',
    success: 'The guest has been checked out.',
  },
  cancel: {
    status: 'cancelled',
    label: 'Cancel booking',
    variant: 'danger',
    title: 'Cancel this booking?',
    message: `The room will be free again. ${SERVICES_NOTE}`,
    success: 'The booking has been cancelled.',
  },
};

// LƯU Ý: khi làm thanh toán QR (docs/api.md mục 11), đơn tự chuyển confirmed sau khi thanh toán,
// admin không duyệt nữa. Lúc đó bỏ ACTIONS.confirm khỏi pending (chỉ còn cancel, hiện "Waiting for payment"),
// sửa ALLOWED_TRANSITIONS ở server/src/services/admin/bookings.service.js và cập nhật Mục 5 của proposal.md.
export const ADMIN_BOOKING_ACTIONS = {
  pending: [ACTIONS.confirm, ACTIONS.cancel],
  confirmed: [ACTIONS.checkIn, ACTIONS.cancel],
  checked_in: [ACTIONS.checkOut],
};

export const getAdminBookingActions = (status) => ADMIN_BOOKING_ACTIONS[status] ?? [];

export const CHECK_IN_TOO_EARLY_NOTE = 'Check-in opens on the check-in date.';
export const ADMIN_BOOKINGS_PAGE_SIZE = 10;
