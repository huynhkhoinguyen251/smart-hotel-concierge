import { Router } from 'express';
import * as foodOrdersController from '../../controllers/admin/foodOrders.controller.js';
import expireUnpaidOrders from '../../middlewares/expireUnpaidOrders.js';
import validate from '../../middlewares/validate.js';
import {
  foodOrderIdValidator,
  listAdminFoodOrdersValidator,
  updateFoodOrderStatusValidator,
} from '../../validators/admin/foodOrders.validator.js';

const router = Router();

router.get(
  '/',
  listAdminFoodOrdersValidator,
  validate,
  expireUnpaidOrders,
  foodOrdersController.getFoodOrders,
);
router.get(
  '/:id',
  foodOrderIdValidator,
  validate,
  expireUnpaidOrders,
  foodOrdersController.getFoodOrder,
);
router.patch(
  '/:id/status',
  updateFoodOrderStatusValidator,
  validate,
  foodOrdersController.updateFoodOrderStatus,
);

export default router;
