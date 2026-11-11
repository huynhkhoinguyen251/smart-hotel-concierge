import { Router } from 'express';
import * as menuItemsController from '../controllers/menuItems.controller.js';
import validate from '../middlewares/validate.js';
import { listMenuItemsValidator, menuItemIdValidator } from '../validators/menuItems.validator.js';

const router = Router();

router.get('/', listMenuItemsValidator, validate, menuItemsController.getMenuItems);
router.get('/:id', menuItemIdValidator, validate, menuItemsController.getMenuItem);

export default router;
