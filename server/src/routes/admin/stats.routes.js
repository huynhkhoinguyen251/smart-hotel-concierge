import { Router } from 'express';
import * as statsController from '../../controllers/admin/stats.controller.js';
import validate from '../../middlewares/validate.js';
import { revenueValidator, topLimitValidator } from '../../validators/admin/stats.validator.js';

const router = Router();

router.get('/overview', statsController.getOverview);
router.get('/revenue', revenueValidator, validate, statsController.getRevenue);
router.get('/top-rooms', topLimitValidator, validate, statsController.getTopRooms);
router.get('/top-services', topLimitValidator, validate, statsController.getTopServices);
router.get('/feedback', statsController.getFeedback);

export default router;
