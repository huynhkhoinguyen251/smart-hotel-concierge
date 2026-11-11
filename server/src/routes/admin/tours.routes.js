import { Router } from 'express';
import * as toursController from '../../controllers/admin/tours.controller.js';
import validate from '../../middlewares/validate.js';
import {
  createTourValidator,
  listAdminToursValidator,
  tourIdValidator,
  updateTourValidator,
} from '../../validators/admin/tours.validator.js';

const router = Router();

router.get('/', listAdminToursValidator, validate, toursController.getTours);
router.post('/', createTourValidator, validate, toursController.createTour);
router.put('/:id', updateTourValidator, validate, toursController.updateTour);
router.delete('/:id', tourIdValidator, validate, toursController.deleteTour);

export default router;
