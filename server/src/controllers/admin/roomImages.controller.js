import { matchedData } from 'express-validator';
import * as roomImagesService from '../../services/admin/roomImages.service.js';
import { sendSuccess } from '../../utils/response.js';

export const setPrimaryImage = async (req, res) => {
  const { id } = matchedData(req);
  const image = await roomImagesService.setPrimaryImage(id);
  sendSuccess(res, image, 'Primary image updated successfully');
};

export const deleteImage = async (req, res) => {
  const { id } = matchedData(req);
  await roomImagesService.deleteImage(id);
  sendSuccess(res, null, 'Image deleted successfully');
};
