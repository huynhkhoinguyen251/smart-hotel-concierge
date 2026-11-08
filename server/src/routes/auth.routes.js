import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);

export default router;
