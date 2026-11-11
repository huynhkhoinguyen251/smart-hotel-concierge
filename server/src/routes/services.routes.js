import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import * as servicesController from '../controllers/services.controller.js';
import validate from '../middlewares/validate.js';
import { serviceReviewsValidator } from '../validators/reviews.validator.js';
import { listServicesValidator, serviceIdValidator } from '../validators/services.validator.js';

const router = Router();

router.get('/', listServicesValidator, validate, servicesController.getServices);
router.get('/:id', serviceIdValidator, validate, servicesController.getService);
// Đánh giá công khai, gồm cả đánh giá đơn vận chuyển dùng dịch vụ này.
router.get('/:id/reviews', serviceReviewsValidator, validate, reviewsController.getServiceReviews);

export default router;
