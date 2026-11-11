import * as toursModel from '../models/tours.model.js';
import AppError from '../utils/AppError.js';
import { getPagination } from '../utils/pagination.js';

export const TOUR_NOT_FOUND = 'Tour not found';

// Dữ liệu trả về cho khách; không có is_active và thời gian tạo/sửa.
const toPublicTour = ({ id, name, description, location, duration, price, image_url }) => ({
  id,
  name,
  description,
  location,
  duration,
  price,
  image_url,
});

// Chỉ trả tour đang hoạt động.
export const listTours = async ({ page, limit, location }) => {
  const pagination = getPagination({ page, limit });
  const filters = { location, is_active: true };

  const [tours, total] = await Promise.all([
    toursModel.findTours({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    toursModel.countTours(filters),
  ]);

  return {
    tours: tours.map(toPublicTour),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

// Tour đã tắt được xem như không tồn tại.
export const getTour = async (id) => {
  const tour = await toursModel.findTourById(id);
  if (!tour || !tour.is_active) {
    throw new AppError(404, TOUR_NOT_FOUND);
  }
  return toPublicTour(tour);
};
