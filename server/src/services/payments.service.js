import { withTransaction } from '../config/db.js';
import {
  INVOICE_UNITS,
  PAYABLE_ORDER_STATUS,
  PAYMENT_HOLD_MINUTES,
  PAYMENT_TARGETS,
} from '../config/payments.js';
import { HOURS_PER_RENTAL_DAY } from '../config/tourism.js';
import * as bookingsModel from '../models/bookings.model.js';
import * as foodOrderItemsModel from '../models/foodOrderItems.model.js';
import * as foodOrdersModel from '../models/foodOrders.model.js';
import * as paymentsModel from '../models/payments.model.js';
import * as serviceBookingsModel from '../models/serviceBookings.model.js';
import * as tourBookingsModel from '../models/tourBookings.model.js';
import * as transportBookingsModel from '../models/transportBookings.model.js';
import * as usersModel from '../models/users.model.js';
import AppError from '../utils/AppError.js';
import { countNights, parseLocalDateTime } from '../utils/date.js';
import { fromCents, multiplyPrice, toCents } from '../utils/money.js';
import { getPagination } from '../utils/pagination.js';
import { cancelBookingWithServices } from './bookings.service.js';
import { toPaymentSummary } from './paymentSummary.service.js';
import * as vouchersService from './vouchers.service.js';
import * as notificationsService from './notifications.service.js';

export const PAYMENT_NOT_FOUND = 'Payment not found';
const PAYMENT_FORBIDDEN = 'You do not have permission to access this payment';
const PAYMENT_EXPIRED = 'The payment time has expired. Please make a new booking.';

const MS_PER_RENTAL_DAY = HOURS_PER_RENTAL_DAY * 60 * 60 * 1000;

// ----- Dữ liệu trả về -----

// Một thanh toán trong GET /payments, GET /payments/:id và API admin (có thêm user).
// expires_at và seconds_left chỉ có khi đơn còn chờ thanh toán (giống object payment của đơn).
export const toPaymentResponse = (payment, { withUser = false } = {}) => ({
  ...toPaymentSummary(
    {
      id: payment.id,
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      paid_at: payment.paid_at,
      invoice_number: payment.invoice_number,
      order_age_seconds: payment.order.age_seconds,
    },
    payment.order,
  ),
  created_at: payment.created_at,
  target: payment.target,
  order_status: payment.order.status,
  ...(withUser && { user: payment.user }),
});

export const findPaymentOr404 = async (id, conn) => {
  const payment = await paymentsModel.findPaymentById(id, conn);
  if (!payment) {
    throw new AppError(404, PAYMENT_NOT_FOUND);
  }
  return payment;
};

const findOwnPayment = async (userId, id) => {
  const payment = await findPaymentOr404(id);
  if (payment.user_id !== userId) {
    throw new AppError(403, PAYMENT_FORBIDDEN);
  }
  return payment;
};

// ----- Hết hạn thanh toán (không dùng bộ đếm giờ chạy nền) -----

// Cách hủy một đơn quá hạn của từng loại, trong transaction đang mở. Hủy đơn đặt phòng thì
// các yêu cầu dịch vụ pending/confirmed của đơn cũng bị hủy (và hoàn tiền nếu đã trả).
const CANCEL_EXPIRED_ORDER = {
  booking_id: (id, conn) => cancelBookingWithServices(id, conn),
  service_booking_id: (id, conn) =>
    serviceBookingsModel.updateServiceBookingStatus(id, 'cancelled', conn),
  food_order_id: async (id, conn) => {
    await foodOrdersModel.updateFoodOrderStatus(id, 'cancelled', conn);
    await vouchersService.releaseVoucher(conn, 'food_order', id);
  },
  tour_booking_id: (id, conn) => tourBookingsModel.updateTourBookingStatus(id, 'cancelled', conn),
  transport_booking_id: (id, conn) =>
    transportBookingsModel.updateTransportBookingStatus(id, { status: 'cancelled' }, conn),
};

// Hủy mọi đơn pending quá hạn giữ mà chưa thanh toán, mỗi loại đơn một transaction.
// Thời gian so sánh bằng NOW() của database (múi giờ +07:00). Được gọi trước các API liên quan
// (middleware expireUnpaidOrders). Khi không có đơn quá hạn, chỉ tốn một câu SELECT nhẹ.
export const expireUnpaidOrders = async () => {
  const columns = await paymentsModel.findColumnsWithExpiredOrders(PAYMENT_HOLD_MINUTES);
  for (const column of columns) {
    await withTransaction(async (conn) => {
      const ids = await paymentsModel.lockExpiredOrderIds(column, PAYMENT_HOLD_MINUTES, conn);
      const kind = PAYMENT_TARGETS.find((target) => target.column === column).type;
      for (const id of ids) {
        await CANCEL_EXPIRED_ORDER[column](id, conn);
        await notificationsService.notifyPaymentExpired(conn, kind, id);
      }
    });
  }
};

// ----- Thanh toán giả lập ("I have paid") -----

const capitalize = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

// body có đúng một khóa đến đơn (validator đã kiểm tra).
const findTargetOfBody = (data) =>
  PAYMENT_TARGETS.find((target) => data[target.field] !== undefined && data[target.field] !== null);

export const payOrder = async (userId, data) => {
  const target = findTargetOfBody(data);
  const orderId = data[target.field];

  const paymentId = await withTransaction(async (conn) => {
    // Khóa đơn và thanh toán của đơn, để không trả hai lần và không trả lúc đơn đang bị hủy.
    const order = await paymentsModel.lockOrderForPayment(
      target.column,
      orderId,
      PAYMENT_HOLD_MINUTES,
      conn,
    );
    if (!order) {
      throw new AppError(404, `${capitalize(target.label)} not found`);
    }
    if (order.owner_id !== userId) {
      throw new AppError(403, `You do not have permission to pay for this ${target.label}`);
    }
    if (order.payment_status === 'paid' || order.payment_status === 'refunded') {
      throw new AppError(409, `This ${target.label} has already been paid`);
    }
    // Đơn quá hạn: còn pending (chưa kịp bị hủy) hoặc đã bị hủy tự động vì quá hạn.
    if (order.expired && ['pending', 'cancelled'].includes(order.order_status)) {
      throw new AppError(400, PAYMENT_EXPIRED);
    }
    if (order.order_status !== PAYABLE_ORDER_STATUS) {
      throw new AppError(400, `Only pending orders can be paid; this ${target.label} is ${order.order_status}`);
    }
    if (!order.payment_id) {
      throw new AppError(400, `This ${target.label} has no payment to make`);
    }

    await paymentsModel.markPaymentPaid(order.payment_id, conn);
    await paymentsModel.createInvoice(
      order.payment_id,
      String(order.payment_id).padStart(6, '0'),
      conn,
    );
    // Phương án A: chỉ đơn đặt phòng tự chuyển confirmed; các loại khác chờ admin duyệt.
    if (target.confirmsOrder) {
      await bookingsModel.updateBookingStatus(order.order_id, 'confirmed', conn);
    }
    await notificationsService.notifyPaymentReceived(conn, target.type, order.order_id);
    return order.payment_id;
  });

  return toPaymentResponse(await findPaymentOr404(paymentId));
};

// ----- Thanh toán của tôi -----

export const listMyPayments = async (userId, { page, limit }) => {
  const pagination = getPagination({ page, limit });
  const filters = { user_id: userId };

  const [payments, total] = await Promise.all([
    paymentsModel.findPayments({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    paymentsModel.countPayments(filters),
  ]);

  return {
    payments: payments.map((payment) => toPaymentResponse(payment)),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getMyPayment = async (userId, id) => toPaymentResponse(await findOwnPayment(userId, id));

// ----- Hóa đơn -----

const sumAmounts = (lines) => fromCents(lines.reduce((sum, line) => sum + toCents(line.amount), 0));

// Mỗi loại đơn trả { lines, discount, total }. Mỗi dòng: description, detail, quantity, unit,
// unit_price, amount. Giá lấy từ giá đã lưu trong đơn lúc đặt.
const INVOICE_BUILDERS = {
  room: async (id) => {
    const booking = await bookingsModel.findBookingById(id);
    const nights = countNights(booking.check_in, booking.check_out);
    return {
      lines: [
        {
          description: `${booking.room.room_type.name}, room ${booking.room.room_number}`,
          detail: `${booking.check_in} to ${booking.check_out}, ${booking.guests} ${
            booking.guests === 1 ? 'guest' : 'guests'
          }`,
          quantity: nights,
          unit: 'night',
          unit_price: booking.price_per_night,
          amount: multiplyPrice(booking.price_per_night, nights),
        },
      ],
      discount: booking.discount_amount,
      voucherCode: booking.voucher?.code ?? null,
      total: booking.total_price,
    };
  },
  service: async (id) => {
    const request = await serviceBookingsModel.findServiceBookingById(id);
    return {
      lines: [
        {
          description: request.service.name,
          detail: `Scheduled for ${request.scheduled_at.slice(0, 16)}, room ${request.booking.room.room_number}`,
          quantity: request.quantity,
          unit: INVOICE_UNITS[request.service.category] ?? null,
          unit_price: request.unit_price,
          amount: request.total_price,
        },
      ],
      discount: 0,
      total: request.total_price,
    };
  },
  food_order: async (id) => {
    const order = await foodOrdersModel.findFoodOrderById(id);
    const items = await foodOrderItemsModel.findItemsByFoodOrderId(id);
    return {
      lines: items.map((item) => ({
        description: item.menu_item.name,
        detail: null,
        quantity: item.quantity,
        unit: 'item',
        unit_price: item.unit_price,
        amount: multiplyPrice(item.unit_price, item.quantity),
      })),
      discount: order.discount_amount,
      voucherCode: order.voucher?.code ?? null,
      total: order.total_price,
    };
  },
  tour: async (id) => {
    const booking = await tourBookingsModel.findTourBookingById(id);
    return {
      lines: [
        {
          description: booking.tour.name,
          detail: `${booking.tour_date}, ${booking.tour.location}`,
          quantity: booking.participants,
          unit: 'person',
          unit_price: booking.unit_price,
          amount: booking.total_price,
        },
      ],
      discount: 0,
      total: booking.total_price,
    };
  },
  transport: async (id) => {
    const booking = await transportBookingsModel.findTransportBookingById(id);
    // Thuê xe máy: số lượng trên hóa đơn là số ngày thuê (mỗi 24 giờ bắt đầu tính là 1 ngày).
    const quantity = booking.end_at
      ? Math.ceil(
          (parseLocalDateTime(booking.end_at.slice(0, 16)) -
            parseLocalDateTime(booking.start_at.slice(0, 16))) /
            MS_PER_RENTAL_DAY,
        )
      : booking.quantity;
    return {
      lines: [
        {
          description: booking.service.name,
          detail: `${booking.start_at.slice(0, 16)}, ${booking.pickup_location} to ${booking.dropoff_location}`,
          quantity,
          unit: INVOICE_UNITS[booking.service.category] ?? null,
          unit_price: booking.unit_price,
          amount: booking.total_price,
        },
      ],
      discount: 0,
      total: booking.total_price,
    };
  },
};

// Hóa đơn của một thanh toán của tôi. Chưa thanh toán thì chưa có hóa đơn (404).
// Thanh toán đã hoàn tiền vẫn xem được hóa đơn cũ, kèm trạng thái refunded.
export const getMyInvoice = async (userId, paymentId) => {
  const payment = await findOwnPayment(userId, paymentId);
  const invoice = await paymentsModel.findInvoiceByPaymentId(payment.id);
  if (!invoice) {
    throw new AppError(404, 'Invoice not found. This payment has not been paid yet.');
  }

  const [guest, order] = await Promise.all([
    usersModel.findUserById(payment.user_id),
    INVOICE_BUILDERS[payment.target.type](payment.target.id),
  ]);

  return {
    invoice_number: invoice.invoice_number,
    issued_at: invoice.issued_at,
    guest: { full_name: guest.full_name, email: guest.email, phone: guest.phone },
    payment: {
      id: payment.id,
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      paid_at: payment.paid_at,
    },
    order: { ...payment.target, status: payment.order.status },
    lines: order.lines,
    subtotal: sumAmounts(order.lines),
    discount: order.discount,
    voucher_code: order.voucherCode ?? null,
    total: order.total,
  };
};
