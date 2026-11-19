import { Router } from 'express';
import * as foodOrdersController from '../controllers/foodOrders.controller.js';
import authenticate from '../middlewares/authenticate.js';
import expireUnpaidOrders from '../middlewares/expireUnpaidOrders.js';
import requireGuest from '../middlewares/requireGuest.js';
import validate from '../middlewares/validate.js';
import {
  createFoodOrderValidator,
  foodOrderIdValidator,
  listMyFoodOrdersValidator,
} from '../validators/foodOrders.validator.js';

const router = Router();

// Mọi API đơn đồ ăn đều cần đăng nhập.
router.use(authenticate);

// Admin không được tạo đơn đồ ăn của khách.
router.post('/', requireGuest, createFoodOrderValidator, validate, foodOrdersController.createFoodOrder);
router.get(
  '/',
  listMyFoodOrdersValidator,
  validate,
  expireUnpaidOrders,
  foodOrdersController.getMyFoodOrders,
);
router.get(
  '/:id',
  foodOrderIdValidator,
  validate,
  expireUnpaidOrders,
  foodOrdersController.getMyFoodOrder,
);
router.patch('/:id/cancel', foodOrderIdValidator, validate, foodOrdersController.cancelMyFoodOrder);

export default router;
