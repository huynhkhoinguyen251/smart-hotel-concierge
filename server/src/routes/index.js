import { Router } from 'express';
import adminRoutes from './admin/index.js';
import amenitiesRoutes from './amenities.routes.js';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import roomsRoutes from './rooms.routes.js';
import roomTypesRoutes from './roomTypes.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/rooms', roomsRoutes);
router.use('/room-types', roomTypesRoutes);
router.use('/amenities', amenitiesRoutes);
router.use('/admin', adminRoutes);

export default router;
