import { Router } from 'express';
import * as roomsController from '../../controllers/admin/rooms.controller.js';
import validate from '../../middlewares/validate.js';
import {
  addRoomImageValidator,
  createRoomValidator,
  listAdminRoomsValidator,
  updateRoomStatusValidator,
  updateRoomValidator,
} from '../../validators/admin/rooms.validator.js';
import { roomIdValidator } from '../../validators/rooms.validator.js';

const router = Router();

router.get('/', listAdminRoomsValidator, validate, roomsController.getRooms);
router.post('/', createRoomValidator, validate, roomsController.createRoom);
router.put('/:id', updateRoomValidator, validate, roomsController.updateRoom);
router.delete('/:id', roomIdValidator, validate, roomsController.deleteRoom);
router.patch('/:id/status', updateRoomStatusValidator, validate, roomsController.updateRoomStatus);
router.post('/:id/images', addRoomImageValidator, validate, roomsController.addRoomImage);

export default router;
