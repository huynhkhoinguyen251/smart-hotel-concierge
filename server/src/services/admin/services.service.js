import * as servicesModel from '../../models/services.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';
import { getPagination } from '../../utils/pagination.js';
import { SERVICE_NOT_FOUND } from '../services.service.js';

const SERVICE_IN_USE = 'This service has existing requests. Deactivate it instead.';

const SERVICE_DB_ERRORS = { referenced: SERVICE_IN_USE };

const findServiceOr404 = async (id, conn) => {
  const service = await servicesModel.findServiceById(id, conn);
  if (!service) {
    throw new AppError(404, SERVICE_NOT_FOUND);
  }
  return service;
};

// Trường không gửi lên nhận giá trị mặc định, dùng chung cho thêm mới và sửa toàn bộ.
const withDefaults = ({ name, category, description, price, image_url, is_active }) => ({
  name,
  category,
  description: description ?? null,
  price,
  image_url: image_url ?? null,
  is_active: is_active ?? true,
});

// Admin xem tất cả dịch vụ, kể cả đã tắt.
export const listServices = async ({ page, limit, ...filters }) => {
  const pagination = getPagination({ page, limit });

  const [services, total] = await Promise.all([
    servicesModel.findServices({ ...filters, limit: pagination.limit, offset: pagination.offset }),
    servicesModel.countServices(filters),
  ]);

  return { services, pagination: { page: pagination.page, limit: pagination.limit, total } };
};

export const createService = async (data) => {
  const id = await servicesModel.createService(withDefaults(data));
  return findServiceOr404(id);
};

// Sửa toàn bộ: description, image_url và is_active không gửi lên sẽ về giá trị mặc định.
export const updateService = async (id, data) => {
  await findServiceOr404(id);
  await servicesModel.updateService(id, withDefaults(data));
  return findServiceOr404(id);
};

export const deleteService = async (id) => {
  await findServiceOr404(id);
  if (await servicesModel.hasServiceRequests(id)) {
    throw new AppError(409, SERVICE_IN_USE);
  }

  try {
    await servicesModel.deleteService(id);
  } catch (error) {
    // Có yêu cầu mới dùng dịch vụ này ngay sau bước kiểm tra ở trên.
    throw mapDbError(error, SERVICE_DB_ERRORS);
  }
};
