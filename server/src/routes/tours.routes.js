import { Router } from 'express';
import * as toursController from '../controllers/tours.controller.js';
import validate from '../middlewares/validate.js';
import { listToursValidator, tourIdValidator } from '../validators/tours.validator.js';

const router = Router();

router.get('/', listToursValidator, validate, toursController.getTours);
router.get('/:id', tourIdValidator, validate, toursController.getTour);

export default router;
