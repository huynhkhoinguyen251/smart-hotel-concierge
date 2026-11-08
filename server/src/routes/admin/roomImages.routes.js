import { Router } from 'express';
import * as roomImagesController from '../../controllers/admin/roomImages.controller.js';
import validate from '../../middlewares/validate.js';
import { imageIdValidator } from '../../validators/admin/rooms.validator.js';

const router = Router();

router.patch('/:id/primary', imageIdValidator, validate, roomImagesController.setPrimaryImage);
router.delete('/:id', imageIdValidator, validate, roomImagesController.deleteImage);

export default router;
