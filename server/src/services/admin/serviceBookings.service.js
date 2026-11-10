import { withTransaction } from '../../config/db.js';
import { SERVICE_REQUEST_TRANSITIONS } from '../../config/services.js';
import * as serviceBookingsModel from '../../models/serviceBookings.model.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/pagination.js';
import {
  findServiceBookingOr404,
  SERVICE_REQUEST_NOT_FOUND,
  toServiceBookingResponse,
} from '../serviceBookings.service.js';

export const listServiceBookings = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [serviceBookings, total] = await Promise.all([
    serviceBookingsModel.findServiceBookings({
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    serviceBookingsModel.countServiceBookings(filters),
  ]);

  return {
    serviceBookings: serviceBookings.map((item) =>
      toServiceBookingResponse(item, { withUser: true }),
    ),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

export const getServiceBooking = async (id) =>
  toServiceBookingResponse(await findServiceBookingOr404(id), { withUser: true });

// Đổi trạng thái theo luồng trong config/services.js.
export const updateServiceBookingStatus = async (id, status) => {
  await withTransaction(async (conn) => {
    const serviceBooking = await serviceBookingsModel.lockServiceBookingById(id, conn);
    if (!serviceBooking) {
      throw new AppError(404, SERVICE_REQUEST_NOT_FOUND);
    }
    if (!SERVICE_REQUEST_TRANSITIONS[serviceBooking.status]?.includes(status)) {
      throw new AppError(400, `Cannot change status from ${serviceBooking.status} to ${status}`);
    }

    await serviceBookingsModel.updateServiceBookingStatus(serviceBooking.id, status, conn);
  });

  return getServiceBooking(id);
};
