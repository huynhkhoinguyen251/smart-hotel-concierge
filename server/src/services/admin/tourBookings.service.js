import { withTransaction } from '../../config/db.js';
import { ORDER_NOT_PAID } from '../../config/payments.js';
import { SERVICE_REQUEST_TRANSITIONS } from '../../config/services.js';
import * as paymentsModel from '../../models/payments.model.js';
import * as tourBookingsModel from '../../models/tourBookings.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';
import {
  findTourBookingOr404,
  TOUR_BOOKING_NOT_FOUND,
  toTourBookingResponse,
} from '../tourBookings.service.js';
import * as notificationsService from '../notifications.service.js';

export const listTourBookings = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [tourBookings, total] = await Promise.all([
    tourBookingsModel.findTourBookings({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    tourBookingsModel.countTourBookings(filters),
  ]);

  return {
    tourBookings: tourBookings.map((item) => toTourBookingResponse(item, { withUser: true })),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getTourBooking = async (id) =>
  toTourBookingResponse(await findTourBookingOr404(id), { withUser: true });

// Đổi trạng thái theo luồng chung với dịch vụ khách sạn (config/services.js).
export const updateTourBookingStatus = async (id, status) => {
  await withTransaction(async (conn) => {
    const tourBooking = await tourBookingsModel.lockTourBookingById(id, conn);
    if (!tourBooking) {
      throw new AppError(404, TOUR_BOOKING_NOT_FOUND);
    }
    if (!SERVICE_REQUEST_TRANSITIONS[tourBooking.status]?.includes(status)) {
      throw new AppError(400, `Cannot change status from ${tourBooking.status} to ${status}`);
    }

    // Phương án A: chỉ duyệt khi khách đã thanh toán QR.
    if (status === 'confirmed') {
      const paymentStatus = await paymentsModel.findPaymentStatusByTarget(
        'tour_booking_id',
        tourBooking.id,
        conn,
      );
      if (paymentStatus !== 'paid') {
        throw new AppError(400, ORDER_NOT_PAID);
      }
    }

    await tourBookingsModel.updateTourBookingStatus(tourBooking.id, status, conn);
    if (status === 'cancelled') {
      // Hủy đơn đã thanh toán thì hoàn tiền.
      await paymentsModel.refundPaidPayment('tour_booking_id', tourBooking.id, conn);
    }
    await notificationsService.notifyOrderStatusChanged(conn, 'tour', tourBooking.id, status);
  });

  return getTourBooking(id);
};
