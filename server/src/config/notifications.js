// Thông báo trong ứng dụng (mục 10 của docs/api.md). Mọi tiêu đề, nội dung và đường dẫn của
// thông báo nằm ở đây. Nội dung bằng tiếng Anh, ngắn, có số đơn, số phòng hoặc ngày.
import { PAYMENT_HOLD_MINUTES } from './payments.js';

export const NOTIFICATION_TYPES = ['booking', 'service', 'food_order', 'tour', 'transport', 'payment', 'support'];

export const MAX_NOTIFICATION_TITLE_LENGTH = 200;

// 5 loại đơn ("kind" giống target.type của thanh toán): loại thông báo, tên gọi,
// trang của khách và trang của admin (đường dẫn của frontend).
export const ORDER_KINDS = {
  room: {
    type: 'booking',
    noun: 'Booking',
    guestPath: (id) => `/my-bookings/${id}`,
    adminPath: (id) => `/admin/bookings/${id}`,
  },
  service: {
    type: 'service',
    noun: 'Service request',
    guestPath: (id) => `/my-services/${id}`,
    adminPath: (id) => `/admin/services/${id}`,
  },
  food_order: {
    type: 'food_order',
    noun: 'Food order',
    guestPath: (id) => `/my-food-orders/${id}`,
    adminPath: (id) => `/admin/food-orders/${id}`,
  },
  tour: {
    type: 'tour',
    noun: 'Tour booking',
    guestPath: (id) => `/my-trips/tours/${id}`,
    adminPath: (id) => `/admin/tourism/tours/${id}`,
  },
  transport: {
    type: 'transport',
    noun: 'Transport request',
    guestPath: (id) => `/my-trips/transport/${id}`,
    adminPath: (id) => `/admin/tourism/transport/${id}`,
  },
};

export const SUPPORT_PATHS = {
  guestPath: (id) => `/support/${id}`,
  adminPath: (id) => `/admin/tickets/${id}`,
};
export const invoicePath = (paymentId) => `/payments/${paymentId}/invoice`;

const REFUND_NOTE = ' Your payment has been refunded.';

// ----- Gửi khách: admin đổi trạng thái đơn -----
// order: { kind, label (ví dụ "food order #12"), room } do notifications.service tạo.
// Trả { title, message } hoặc null nếu trạng thái này không cần báo.
export const orderStatusNotification = (order, status, { refunded = false, plate = null } = {}) => {
  const { noun } = ORDER_KINDS[order.kind];
  switch (status) {
    case 'confirmed':
      return {
        title: `${noun} confirmed`,
        message: `Your ${order.label} has been confirmed.${plate ? ` Licence plate: ${plate}.` : ''}`,
      };
    case 'checked_in':
      return { title: 'Checked in', message: `You have checked in to room ${order.room}. Enjoy your stay!` };
    case 'checked_out':
      return {
        title: 'Checked out',
        message: `You have checked out of room ${order.room}. Thank you for staying with us. You can now review your stay.`,
      };
    case 'in_progress':
      return { title: `${noun} in progress`, message: `Your ${order.label} is now in progress.` };
    case 'preparing':
      return { title: 'Food order being prepared', message: `The kitchen is preparing your ${order.label}.` };
    case 'delivering':
      return {
        title: 'Food order on the way',
        message: `Your ${order.label} is on the way to room ${order.room}.`,
      };
    case 'completed':
      return {
        title: `${noun} completed`,
        message: `Your ${order.label} has been completed. You can now leave a review.`,
      };
    case 'cancelled':
      return {
        title: `${noun} cancelled`,
        message: `The hotel has cancelled your ${order.label}.${refunded ? REFUND_NOTE : ''}`,
      };
    default:
      return null;
  }
};

// Yêu cầu dịch vụ bị hủy theo đơn đặt phòng.
export const cascadeServiceCancelledNotification = (order, bookingId, refunded) => ({
  title: 'Service request cancelled',
  message: `Your ${order.label} was cancelled together with booking #${bookingId}.${refunded ? REFUND_NOTE : ''}`,
});

// Đơn bị hủy vì không thanh toán kịp.
export const paymentExpiredNotification = (order) => ({
  title: `${ORDER_KINDS[order.kind].noun} cancelled`,
  message: `Your ${order.label} was cancelled because it was not paid within ${PAYMENT_HOLD_MINUTES} minutes.`,
});

// ----- Thanh toán -----
export const paymentReceivedNotification = (order) =>
  order.kind === 'room'
    ? {
        title: 'Booking confirmed',
        message: `Payment received. Your ${order.label} is confirmed.`,
      }
    : {
        title: 'Payment received, waiting for confirmation',
        message: `Payment received for your ${order.label}. Reception will confirm it soon.`,
      };

// Gửi admin: đơn đã thanh toán.
export const adminPaidOrderNotification = (order) =>
  order.kind === 'room'
    ? {
        title: 'New paid booking',
        message: `${order.guestName} booked and paid ${order.label}.`,
      }
    : {
        title: `${ORDER_KINDS[order.kind].noun} waiting for confirmation`,
        message: `${order.guestName} paid ${order.label}. Please confirm it.`,
      };

// ----- Hỗ trợ -----
export const ticketCreatedNotification = (ticket) => ({
  title: 'New support request',
  message: `${ticket.guestName} sent support request #${ticket.id}: ${ticket.subject}`,
});
export const ticketGuestReplyNotification = (ticket) => ({
  title: 'New message from a guest',
  message: `${ticket.guestName} replied to support request #${ticket.id}: ${ticket.subject}`,
});
export const ticketReplyNotification = (ticket) => ({
  title: 'Reception replied',
  message: `Reception replied to your support request #${ticket.id}: ${ticket.subject}`,
});
export const ticketResolvedNotification = (ticket) => ({
  title: 'Support request resolved',
  message: `Your support request #${ticket.id} (${ticket.subject}) has been marked as resolved.`,
});
