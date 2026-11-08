import { Router } from 'express';
import * as roomTypesController from '../controllers/roomTypes.controller.js';

const router = Router();

router.get('/', roomTypesController.getRoomTypes);

export default router;
