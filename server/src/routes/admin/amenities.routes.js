import { Router } from 'express';
import * as amenitiesController from '../../controllers/admin/amenities.controller.js';
import validate from '../../middlewares/validate.js';
import {
  amenityIdValidator,
  createAmenityValidator,
  updateAmenityValidator,
} from '../../validators/admin/amenities.validator.js';

const router = Router();

router.post('/', createAmenityValidator, validate, amenitiesController.createAmenity);
router.put('/:id', updateAmenityValidator, validate, amenitiesController.updateAmenity);
router.delete('/:id', amenityIdValidator, validate, amenitiesController.deleteAmenity);

export default router;
