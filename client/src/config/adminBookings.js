// Quản lý đơn đặt phòng (admin), theo luồng trạng thái ở Mục 5 của proposal.md.

const SERVICES_NOTE =
  'Pending and confirmed service requests of this booking will also be cancelled.';

// Các thao tác admin được làm ở từng trạng thái (giống ALLOWED_TRANSITIONS của backend), cùng dạng với
// config/adminRequests.js để dùng chung AdminStatusActions. status: trạng thái mới gửi lên;
// variant: kiểu nút; title/message: nội dung hộp thoại xác nhận; success: thông báo sau khi đổi.
const ACTIONS = {
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

// Đơn pending tự chuyển confirmed khi khách thanh toán QR (mục 11 của docs/api.md), nên admin chỉ hủy được.
export const ADMIN_BOOKING_ACTIONS = {
  pending: [ACTIONS.cancel],
  confirmed: [ACTIONS.checkIn, ACTIONS.cancel],
  checked_in: [ACTIONS.checkOut],
};

export const CHECK_IN_TOO_EARLY_NOTE = 'Check-in opens on the check-in date.';
export const ADMIN_BOOKINGS_PAGE_SIZE = 10;
