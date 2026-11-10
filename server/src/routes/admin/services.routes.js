import { Router } from 'express';
import * as servicesController from '../../controllers/admin/services.controller.js';
import validate from '../../middlewares/validate.js';
import {
  createServiceValidator,
  listAdminServicesValidator,
  serviceIdValidator,
  updateServiceValidator,
} from '../../validators/admin/services.validator.js';

const router = Router();

router.get('/', listAdminServicesValidator, validate, servicesController.getServices);
router.post('/', createServiceValidator, validate, servicesController.createService);
router.put('/:id', updateServiceValidator, validate, servicesController.updateService);
router.delete('/:id', serviceIdValidator, validate, servicesController.deleteService);

export default router;
