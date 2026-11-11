import * as toursModel from '../../models/tours.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';
import { getPagination } from '../../utils/pagination.js';
import { TOUR_NOT_FOUND } from '../tours.service.js';

const TOUR_IN_USE = 'This tour has existing bookings. Deactivate it instead.';

const TOUR_DB_ERRORS = { referenced: TOUR_IN_USE };

const findTourOr404 = async (id, conn) => {
  const tour = await toursModel.findTourById(id, conn);
  if (!tour) {
    throw new AppError(404, TOUR_NOT_FOUND);
  }
  return tour;
};

// Trường không gửi lên nhận giá trị mặc định, dùng chung cho thêm mới và sửa toàn bộ.
const withDefaults = ({
  name,
  description,
  location,
  duration,
  price,
  image_url,
  is_active,
}) => ({
  name,
  description: description ?? null,
  location,
  duration,
  price,
  image_url: image_url ?? null,
  is_active: is_active ?? true,
});

// Admin xem tất cả tour, kể cả đã tắt.
export const listTours = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [tours, total] = await Promise.all([
    toursModel.findTours({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    toursModel.countTours(filters),
  ]);

  return { tours, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

export const createTour = async (data) => {
  const id = await toursModel.createTour(withDefaults(data));
  return findTourOr404(id);
};

// Sửa toàn bộ: description, image_url và is_active không gửi lên sẽ về giá trị mặc định.
export const updateTour = async (id, data) => {
  await findTourOr404(id);
  await toursModel.updateTour(id, withDefaults(data));
  return findTourOr404(id);
};

export const deleteTour = async (id) => {
  await findTourOr404(id);
  if (await toursModel.hasTourBookings(id)) {
    throw new AppError(409, TOUR_IN_USE);
  }

  try {
    await toursModel.deleteTour(id);
  } catch (error) {
    // Có đơn mới đặt tour này ngay sau bước kiểm tra ở trên.
    throw mapDbError(error, TOUR_DB_ERRORS);
  }
};
