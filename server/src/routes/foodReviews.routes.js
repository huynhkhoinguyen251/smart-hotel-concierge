import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import validate from '../middlewares/validate.js';
import { foodReviewsValidator } from '../validators/reviews.validator.js';

const router = Router();

// Mục chung "Đánh giá đồ ăn" ở trang thực đơn, không cần đăng nhập.
router.get('/', foodReviewsValidator, validate, reviewsController.getFoodReviews);

export default router;
