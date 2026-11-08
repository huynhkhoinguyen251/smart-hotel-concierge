import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import { changePasswordValidator, updateMeValidator } from '../validators/users.validator.js';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.put('/me', authenticate, updateMeValidator, validate, usersController.updateMe);
router.put(
  '/me/password',
  authenticate,
  changePasswordValidator,
  validate,
  usersController.changePassword,
);

export default router;
