import * as servicesModel from '../models/services.model.js';
import AppError from '../utils/AppError.js';
import { getPagination } from '../utils/pagination.js';

export const SERVICE_NOT_FOUND = 'Service not found';

// Dữ liệu trả về cho khách; không có is_active và thời gian tạo/sửa.
const toPublicService = ({ id, name, category, description, price, image_url }) => ({
  id,
  name,
  category,
  description,
  price,
  image_url,
});

// Chỉ trả dịch vụ đang hoạt động.
export const listServices = async ({ page, limit, category }) => {
  const pagination = getPagination({ page, limit });
  const filters = { category, is_active: true };

  const [services, total] = await Promise.all([
    servicesModel.findServices({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    servicesModel.countServices(filters),
  ]);

  return {
    services: services.map(toPublicService),
    pagination: { page: pagination.page, limit: pagination.limit, total },
  };
};

// Dịch vụ đã tắt được xem như không tồn tại.
export const getService = async (id) => {
  const service = await servicesModel.findServiceById(id);
  if (!service || !service.is_active) {
    throw new AppError(404, SERVICE_NOT_FOUND);
  }
  return toPublicService(service);
};
