import { Router } from 'express';
import * as uploadsController from '../../controllers/admin/uploads.controller.js';
import uploadImage from '../../middlewares/uploadImage.js';

const router = Router();

router.post('/', uploadImage, uploadsController.uploadImage);

export default router;
