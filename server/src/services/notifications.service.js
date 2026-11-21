import {
  adminPaidOrderNotification,
  cascadeServiceCancelledNotification,
  ORDER_KINDS,
  orderStatusNotification,
  paymentExpiredNotification,
  paymentReceivedNotification,
  SUPPORT_PATHS,
  ticketCreatedNotification,
  ticketGuestReplyNotification,
  ticketReplyNotification,
  ticketResolvedNotification,
} from '../config/notifications.js';
import * as bookingsModel from '../models/bookings.model.js';
import * as foodOrdersModel from '../models/foodOrders.model.js';
import * as notificationsModel from '../models/notifications.model.js';
import * as serviceBookingsModel from '../models/serviceBookings.model.js';
import * as supportTicketsModel from '../models/supportTickets.model.js';
import * as tourBookingsModel from '../models/tourBookings.model.js';
import * as transportBookingsModel from '../models/transportBookings.model.js';
import * as usersModel from '../models/users.model.js';
import AppError from '../utils/AppError.js';
import { formatDisplayDate } from '../utils/date.js';
import { getPagination } from '../utils/pagination.js';

// Thông báo trong ứng dụng (mục 10 của docs/api.md).
// Các hàm notify* nhận conn của transaction đang mở: thông báo chỉ được lưu khi thay đổi gây ra nó
// được commit. Tiêu đề và nội dung lấy từ config/notifications.js.

const NOTIFICATION_NOT_FOUND = 'Notification not found';

// ----- Tạo thông báo -----

export const notify = async (conn, { userId, type, title, message, linkPath = null }) => {
  await notificationsModel.createNotifications(
    [{ user_id: userId, type, title, message, link_path: linkPath }],
    conn,
  );
};

// Gửi cho mọi admin đang hoạt động.
export const notifyAdmins = async (conn, { type, title, message, linkPath = null }) => {
  const adminIds = await usersModel.findActiveAdminIds(conn);
  await notificationsModel.createNotifications(
    adminIds.map((id) => ({ user_id: id, type, title, message, link_path: linkPath })),
    conn,
  );
};

// ----- Mô tả một đơn để ghép vào câu thông báo -----

// Đọc đơn bằng conn của transaction (thấy cả thay đổi chưa commit). Trả userId, guestName,
// label (ví dụ "food order #12"), room (số phòng nếu có), payment, plate.
const ORDER_LOADERS = {
  room: async (id, conn) => {
    const booking = await bookingsModel.findBookingById(id, conn);
    return {
      user: booking.user,
      label: `booking #${booking.id} for room ${booking.room.room_number} (${formatDisplayDate(
        booking.check_in,
      )} to ${formatDisplayDate(booking.check_out)})`,
      room: booking.room.room_number,
      payment: booking.payment,
    };
  },
  service: async (id, conn) => {
    const request = await serviceBookingsModel.findServiceBookingById(id, conn);
    return {
      user: request.user,
      label: `${request.service.name} request #${request.id} (${formatDisplayDate(request.scheduled_at)})`,
      room: request.booking.room.room_number,
      payment: request.payment,
    };
  },
  food_order: async (id, conn) => {
    const order = await foodOrdersModel.findFoodOrderById(id, conn);
    return {
      user: order.user,
      label: `food order #${order.id}`,
      room: order.booking.room.room_number,
      payment: order.payment,
    };
  },
  tour: async (id, conn) => {
    const booking = await tourBookingsModel.findTourBookingById(id, conn);
    return {
      user: booking.user,
      label: `${booking.tour.name} booking #${booking.id} (${formatDisplayDate(booking.tour_date)})`,
      payment: booking.payment,
    };
  },
  transport: async (id, conn) => {
    const booking = await transportBookingsModel.findTransportBookingById(id, conn);
    return {
      user: booking.user,
      label: `${booking.service.name} request #${booking.id} (${formatDisplayDate(booking.start_at)})`,
      payment: booking.payment,
      plate: booking.vehicle_plate,
    };
  },
};

const describeOrder = async (kind, id, conn) => {
  const order = await ORDER_LOADERS[kind](id, conn);
  return { kind, id, guestName: order.user.full_name, ...order };
};

const notifyGuestAboutOrder = (conn, order, content) =>
  notify(conn, {
    userId: order.user.id,
    type: ORDER_KINDS[order.kind].type,
    ...content,
    linkPath: ORDER_KINDS[order.kind].guestPath(order.id),
  });

// ----- Sự kiện của đơn -----

// Admin đổi trạng thái đơn: báo cho khách. Hủy đơn đã thanh toán thì có câu "đã hoàn tiền";
// duyệt thuê xe máy thì có biển số.
export const notifyOrderStatusChanged = async (conn, kind, id, status) => {
  const order = await describeOrder(kind, id, conn);
  const content = orderStatusNotification(order, status, {
    refunded: status === 'cancelled' && order.payment?.status === 'refunded',
    plate: status === 'confirmed' ? (order.plate ?? null) : null,
  });
  if (content) {
    await notifyGuestAboutOrder(conn, order, content);
  }
};

// Các yêu cầu dịch vụ bị hủy theo đơn đặt phòng.
export const notifyServicesCancelledWithBooking = async (conn, bookingId, serviceIds) => {
  for (const serviceId of serviceIds) {
    const order = await describeOrder('service', serviceId, conn);
    await notifyGuestAboutOrder(
      conn,
      order,
      cascadeServiceCancelledNotification(order, bookingId, order.payment?.status === 'refunded'),
    );
  }
};

// Đơn bị hủy vì quá hạn thanh toán.
export const notifyPaymentExpired = async (conn, kind, id) => {
  const order = await describeOrder(kind, id, conn);
  await notifyGuestAboutOrder(conn, order, paymentExpiredNotification(order));
};

// Khách vừa thanh toán: báo cho khách (đơn đặt phòng: đã xác nhận; đơn khác: chờ xác nhận)
// và báo cho admin (đơn khác: cần duyệt; đơn đặt phòng: chỉ để biết).
export const notifyPaymentReceived = async (conn, kind, id) => {
  const order = await describeOrder(kind, id, conn);
  await notify(conn, {
    userId: order.user.id,
    type: 'payment',
    ...paymentReceivedNotification(order),
    linkPath: ORDER_KINDS[kind].guestPath(id),
  });
  await notifyAdmins(conn, {
    type: ORDER_KINDS[kind].type,
    ...adminPaidOrderNotification(order),
    linkPath: ORDER_KINDS[kind].adminPath(id),
  });
};

// ----- Sự kiện của yêu cầu hỗ trợ -----

const describeTicket = async (id, conn) => {
  const ticket = await supportTicketsModel.findTicketById(id, conn);
  return { id: ticket.id, subject: ticket.subject, guestId: ticket.guest.id, guestName: ticket.guest.full_name };
};

export const notifyTicketCreated = async (conn, ticketId) => {
  const ticket = await describeTicket(ticketId, conn);
  await notifyAdmins(conn, {
    type: 'support',
    ...ticketCreatedNotification(ticket),
    linkPath: SUPPORT_PATHS.adminPath(ticket.id),
  });
};

export const notifyTicketGuestReply = async (conn, ticketId) => {
  const ticket = await describeTicket(ticketId, conn);
  await notifyAdmins(conn, {
    type: 'support',
    ...ticketGuestReplyNotification(ticket),
    linkPath: SUPPORT_PATHS.adminPath(ticket.id),
  });
};

export const notifyTicketReply = async (conn, ticketId) => {
  const ticket = await describeTicket(ticketId, conn);
  await notify(conn, {
    userId: ticket.guestId,
    type: 'support',
    ...ticketReplyNotification(ticket),
    linkPath: SUPPORT_PATHS.guestPath(ticket.id),
  });
};

export const notifyTicketResolved = async (conn, ticketId) => {
  const ticket = await describeTicket(ticketId, conn);
  await notify(conn, {
    userId: ticket.guestId,
    type: 'support',
    ...ticketResolvedNotification(ticket),
    linkPath: SUPPORT_PATHS.guestPath(ticket.id),
  });
};

// ----- API của người dùng (khách và admin đều dùng) -----

export const listMyNotifications = async (userId, { page, limit, unread_only = false }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId, unread_only };

  const [notifications, total, unreadCount] = await Promise.all([
    notificationsModel.findNotifications({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    notificationsModel.countNotifications(filters),
    notificationsModel.countUnread(userId),
  ]);

  return {
    notifications: notifications.map(({ user_id, ...notification }) => notification),
    pagination: { page: pagination.page, limit: pagination.limit, total },
    unreadCount,
  };
};

// Đánh dấu một thông báo đã đọc; gọi lại nhiều lần vẫn trả 200.
export const markMyNotificationRead = async (userId, id) => {
  const notification = await notificationsModel.findNotificationById(id);
  if (!notification) {
    throw new AppError(404, NOTIFICATION_NOT_FOUND);
  }
  if (notification.user_id !== userId) {
    throw new AppError(403, 'You do not have permission to access this notification');
  }
  await notificationsModel.markNotificationRead(id);
  const { user_id, ...data } = notification;
  return { notification: { ...data, is_read: true }, unreadCount: await notificationsModel.countUnread(userId) };
};

export const markAllMyNotificationsRead = async (userId) => {
  await notificationsModel.markAllRead(userId);
  return { unreadCount: await notificationsModel.countUnread(userId) };
};
