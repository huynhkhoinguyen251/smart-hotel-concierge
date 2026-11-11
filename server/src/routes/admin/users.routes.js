import { Router } from 'express';
import * as usersController from '../../controllers/admin/users.controller.js';
import validate from '../../middlewares/validate.js';
import {
  listUsersValidator,
  updateUserRoleValidator,
  updateUserStatusValidator,
  userIdValidator,
} from '../../validators/admin/users.validator.js';

const router = Router();

router.get('/', listUsersValidator, validate, usersController.getUsers);
router.get('/:id', userIdValidator, validate, usersController.getUser);
router.patch('/:id/status', updateUserStatusValidator, validate, usersController.updateUserStatus);
router.patch('/:id/role', updateUserRoleValidator, validate, usersController.updateUserRole);

export default router;
