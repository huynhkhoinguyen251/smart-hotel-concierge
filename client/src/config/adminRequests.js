// Các thao tác admin trên yêu cầu của khách (mục 9 của docs/api.md, luồng ở Mục 5 của proposal.md).
// Giống các TRANSITIONS của backend (server/src/config/services.js, food.js, tickets.js).
// Mỗi thao tác: status (trạng thái mới), label (nút), variant, title/message (hộp thoại),
// success (thông báo sau khi xong). confirm: false thì làm ngay, không hỏi lại.

// Luồng chung của yêu cầu dịch vụ, đơn tour và đơn vận chuyển:
// pending → confirmed → in_progress → completed; hủy được khi còn pending hoặc confirmed.
// noun: "request" hoặc "booking", dùng trong chữ của nút hủy và hộp thoại.
const makeServiceFlowActions = (noun) => {
  const cancel = {
    status: 'cancelled',
    label: `Cancel ${noun}`,
    variant: 'danger',
    title: `Cancel this ${noun}?`,
    message: `The guest will see the ${noun} as cancelled. This cannot be undone.`,
    success: `The ${noun} has been cancelled.`,
  };
  return {
    pending: [
      {
        status: 'confirmed',
        label: 'Confirm',
        variant: 'primary',
        title: `Confirm this ${noun}?`,
        message: `The guest will see the ${noun} as confirmed and can no longer cancel it online.`,
        success: `The ${noun} has been confirmed.`,
      },
      cancel,
    ],
    confirmed: [
      {
        status: 'in_progress',
        label: 'Start',
        variant: 'primary',
        title: `Start this ${noun}?`,
        message: `The ${noun} will be marked as in progress.`,
        success: `The ${noun} is now in progress.`,
      },
      cancel,
    ],
    in_progress: [
      {
        status: 'completed',
        label: 'Complete',
        variant: 'primary',
        title: `Complete this ${noun}?`,
        message: `The ${noun} will count as revenue, and the guest can review it.`,
        success: `The ${noun} has been completed.`,
      },
    ],
  };
};

export const SERVICE_REQUEST_ADMIN_ACTIONS = makeServiceFlowActions('request');
export const TOUR_BOOKING_ADMIN_ACTIONS = makeServiceFlowActions('booking');
export const TRANSPORT_BOOKING_ADMIN_ACTIONS = makeServiceFlowActions('request');

// Đơn đồ ăn: pending → confirmed → preparing → delivering → completed.
export const FOOD_ORDER_ADMIN_ACTIONS = {
  pending: [
    {
      status: 'confirmed',
      label: 'Confirm',
      variant: 'primary',
      title: 'Confirm this order?',
      message: 'The guest will see the order as confirmed and can no longer cancel it online.',
      success: 'The order has been confirmed.',
    },
    {
      status: 'cancelled',
      label: 'Cancel order',
      variant: 'danger',
      title: 'Cancel this order?',
      message: 'The guest will see the order as cancelled. This cannot be undone.',
      success: 'The order has been cancelled.',
    },
  ],
  confirmed: [
    {
      status: 'preparing',
      label: 'Start preparing',
      variant: 'primary',
      title: 'Start preparing this order?',
      message: 'The kitchen starts preparing the order. It can no longer be cancelled.',
      success: 'The order is being prepared.',
    },
    {
      status: 'cancelled',
      label: 'Cancel order',
      variant: 'danger',
      title: 'Cancel this order?',
      message: 'The guest will see the order as cancelled. This cannot be undone.',
      success: 'The order has been cancelled.',
    },
  ],
  preparing: [
    {
      status: 'delivering',
      label: 'Out for delivery',
      variant: 'primary',
      title: 'Send this order out for delivery?',
      message: 'The guest will see that the order is on the way to the room.',
      success: 'The order is out for delivery.',
    },
  ],
  delivering: [
    {
      status: 'completed',
      label: 'Mark delivered',
      variant: 'primary',
      title: 'Mark this order as delivered?',
      message: 'The order will count as revenue, and the guest can review it.',
      success: 'The order has been delivered.',
    },
  ],
};

// Yêu cầu hỗ trợ: open → in_progress → resolved (một chiều).
export const TICKET_ADMIN_ACTIONS = {
  open: [
    {
      status: 'in_progress',
      label: 'Mark in progress',
      variant: 'secondary',
      confirm: false,
      success: 'The request is now in progress.',
    },
  ],
  in_progress: [
    {
      status: 'resolved',
      label: 'Mark as resolved',
      variant: 'primary',
      title: 'Mark this request as resolved?',
      message: 'The guest will not be able to send more messages.',
      success: 'The request has been resolved.',
    },
  ],
};

export const getActions = (actionsByStatus, status) => actionsByStatus[status] ?? [];

// Biển số xe khi duyệt đơn vận chuyển. Giống validator của backend: tối đa 20 ký tự,
// chữ, số, "-" và "."; backend tự viết hoa. Bắt buộc khi duyệt thuê xe máy.
export const PLATE_REQUIRED_CATEGORIES = ['motorbike_rental'];
export const VEHICLE_PLATE_MAX_LENGTH = 20;
export const VEHICLE_PLATE_PATTERN = /^[A-Za-z0-9.-]+$/;

export const ADMIN_LIST_PAGE_SIZE = 10;
