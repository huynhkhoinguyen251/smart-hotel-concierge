import { Router } from 'express';
import * as roomTypesController from '../../controllers/admin/roomTypes.controller.js';
import validate from '../../middlewares/validate.js';
import {
  createRoomTypeValidator,
  roomTypeIdValidator,
  updateRoomTypeValidator,
} from '../../validators/admin/roomTypes.validator.js';

const router = Router();

router.post('/', createRoomTypeValidator, validate, roomTypesController.createRoomType);
router.put('/:id', updateRoomTypeValidator, validate, roomTypesController.updateRoomType);
router.delete('/:id', roomTypeIdValidator, validate, roomTypesController.deleteRoomType);

export default router;
