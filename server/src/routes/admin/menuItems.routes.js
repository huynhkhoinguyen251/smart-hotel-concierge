import { Router } from 'express';
import * as menuItemsController from '../../controllers/admin/menuItems.controller.js';
import validate from '../../middlewares/validate.js';
import {
  createMenuItemValidator,
  listAdminMenuItemsValidator,
  menuItemIdValidator,
  updateMenuItemValidator,
} from '../../validators/admin/menuItems.validator.js';

const router = Router();

router.get('/', listAdminMenuItemsValidator, validate, menuItemsController.getMenuItems);
router.post('/', createMenuItemValidator, validate, menuItemsController.createMenuItem);
router.put('/:id', updateMenuItemValidator, validate, menuItemsController.updateMenuItem);
router.delete('/:id', menuItemIdValidator, validate, menuItemsController.deleteMenuItem);

export default router;
