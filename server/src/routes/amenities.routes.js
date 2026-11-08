import { Router } from 'express';
import * as amenitiesController from '../controllers/amenities.controller.js';

const router = Router();

router.get('/', amenitiesController.getAmenities);

export default router;
