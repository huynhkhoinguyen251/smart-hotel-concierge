import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import authenticate from '../middlewares/authenticate.js';
import requireGuest from '../middlewares/requireGuest.js';
import validate from '../middlewares/validate.js';
import {
  createReviewValidator,
  listMyReviewsValidator,
} from '../validators/reviews.validator.js';

const router = Router();

// Tạo và xem đánh giá của tôi cần đăng nhập. Danh sách công khai nằm ở route phòng,
// dịch vụ, tour và /food-reviews.
router.use(authenticate);

// Admin không được viết đánh giá.
router.post('/', requireGuest, createReviewValidator, validate, reviewsController.createReview);
router.get('/', listMyReviewsValidator, validate, reviewsController.getMyReviews);

export default router;
