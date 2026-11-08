import * as amenitiesModel from '../../models/amenities.model.js';
import AppError from '../../utils/AppError.js';
import { mapDbError } from '../../utils/dbErrors.js';

const AMENITY_DB_ERRORS = { duplicate: 'Amenity name already exists' };

const findAmenityOr404 = async (id) => {
  const amenity = await amenitiesModel.findAmenityById(id);
  if (!amenity) {
    throw new AppError(404, 'Amenity not found');
  }
  return amenity;
};

export const createAmenity = async ({ name }) => {
  let id;
  try {
    id = await amenitiesModel.createAmenity(name);
  } catch (error) {
    throw mapDbError(error, AMENITY_DB_ERRORS);
  }
  return findAmenityOr404(id);
};

export const updateAmenity = async (id, { name }) => {
  await findAmenityOr404(id);
  try {
    await amenitiesModel.updateAmenity(id, name);
  } catch (error) {
    throw mapDbError(error, AMENITY_DB_ERRORS);
  }
  return findAmenityOr404(id);
};

// Được xóa kể cả khi loại phòng đang dùng; liên kết tự xóa theo.
export const deleteAmenity = async (id) => {
  await findAmenityOr404(id);
  await amenitiesModel.deleteAmenity(id);
};
