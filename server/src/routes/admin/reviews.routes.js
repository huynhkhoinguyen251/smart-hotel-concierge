import { Router } from 'express';
import * as reviewsController from '../../controllers/admin/reviews.controller.js';
import validate from '../../middlewares/validate.js';
import { listAdminReviewsValidator } from '../../validators/admin/reviews.validator.js';

const router = Router();

router.get('/', listAdminReviewsValidator, validate, reviewsController.getReviews);

export default router;
