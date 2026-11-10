import { Router } from 'express';
import * as servicesController from '../controllers/services.controller.js';
import validate from '../middlewares/validate.js';
import { listServicesValidator, serviceIdValidator } from '../validators/services.validator.js';

const router = Router();

router.get('/', listServicesValidator, validate, servicesController.getServices);
router.get('/:id', serviceIdValidator, validate, servicesController.getService);

export default router;
