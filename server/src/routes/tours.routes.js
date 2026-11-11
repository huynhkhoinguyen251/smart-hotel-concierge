import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import * as toursController from '../controllers/tours.controller.js';
import validate from '../middlewares/validate.js';
import { tourReviewsValidator } from '../validators/reviews.validator.js';
import { listToursValidator, tourIdValidator } from '../validators/tours.validator.js';

const router = Router();

router.get('/', listToursValidator, validate, toursController.getTours);
router.get('/:id', tourIdValidator, validate, toursController.getTour);
router.get('/:id/reviews', tourReviewsValidator, validate, reviewsController.getTourReviews);

export default router;
