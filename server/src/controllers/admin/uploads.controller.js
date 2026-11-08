import * as uploadsService from '../../services/admin/uploads.service.js';
import { sendSuccess } from '../../utils/response.js';

// req.file do middleware uploadImage tạo ra, sau khi đã kiểm tra loại file và dung lượng.
export const uploadImage = (req, res) => {
  const imageUrl = uploadsService.toImageUrl(req.file.filename);
  sendSuccess(res, { image_url: imageUrl }, 'Image uploaded successfully', 201);
};
