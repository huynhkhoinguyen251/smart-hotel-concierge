import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import * as roomsController from '../controllers/rooms.controller.js';
import validate from '../middlewares/validate.js';
import { roomReviewsValidator } from '../validators/reviews.validator.js';
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
router.get('/:id/reviews', roomReviewsValidator, validate, reviewsController.getRoomReviews);

export default router;
