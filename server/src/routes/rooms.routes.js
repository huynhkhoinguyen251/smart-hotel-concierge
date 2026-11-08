import { Router } from 'express';
import * as roomsController from '../controllers/rooms.controller.js';
import validate from '../middlewares/validate.js';
import {
  availabilityValidator,
  listRoomsValidator,
  roomIdValidator,
} from '../validators/rooms.validator.js';

const router = Router();

router.get('/', listRoomsValidator, validate, roomsController.getRooms);
router.get('/:id', roomIdValidator, validate, roomsController.getRoomById);
router.get(
  '/:id/availability',
  availabilityValidator,
  validate,
  roomsController.getRoomAvailability,
);

export default router;
