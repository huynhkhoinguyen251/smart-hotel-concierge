import { withTransaction } from '../../config/db.js';
import { SERVICE_REQUEST_TRANSITIONS } from '../../config/services.js';
import { PLATE_REQUIRED_CATEGORIES } from '../../config/tourism.js';
import * as transportBookingsModel from '../../models/transportBookings.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';
import {
  findTransportBookingOr404,
  TRANSPORT_BOOKING_NOT_FOUND,
  toTransportBookingResponse,
} from '../transportBookings.service.js';

export const listTransportBookings = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [transportBookings, total] = await Promise.all([
    transportBookingsModel.findTransportBookings({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    transportBookingsModel.countTransportBookings(filters),
  ]);

  return {
    transportBookings: transportBookings.map((item) =>
      toTransportBookingResponse(item, { withUser: true }),
    ),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getTransportBooking = async (id) =>
  toTransportBookingResponse(await findTransportBookingOr404(id), { withUser: true });

// Đổi trạng thái theo luồng chung với dịch vụ khách sạn (config/services.js).
// Biển số xe chỉ được nhập khi duyệt (confirmed), và bắt buộc khi duyệt thuê xe máy.
export const updateTransportBookingStatus = async (id, { status, vehicle_plate }) => {
  await withTransaction(async (conn) => {
    const transportBooking = await transportBookingsModel.lockTransportBookingById(id, conn);
    if (!transportBooking) {
      throw new AppError(404, TRANSPORT_BOOKING_NOT_FOUND);
    }
    if (vehicle_plate !== undefined && status !== 'confirmed') {
      throw new AppError(
        400,
        'A licence plate (vehicle_plate) can only be set when confirming a booking',
      );
    }
    if (!SERVICE_REQUEST_TRANSITIONS[transportBooking.status]?.includes(status)) {
      throw new AppError(
        400,
        `Cannot change status from ${transportBooking.status} to ${status}`,
      );
    }
    if (
      status === 'confirmed' &&
      vehicle_plate === undefined &&
      PLATE_REQUIRED_CATEGORIES.includes(transportBooking.category)
    ) {
      throw new AppError(400, 'A licence plate is required to approve a motorbike rental');
    }

    await transportBookingsModel.updateTransportBookingStatus(
      transportBooking.id,
      { status, vehicle_plate },
      conn,
    );
  });

  return getTransportBooking(id);
};
