import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import requireAdmin from '../../middlewares/requireAdmin.js';
import amenitiesRoutes from './amenities.routes.js';
import bookingsRoutes from './bookings.routes.js';
import foodOrdersRoutes from './foodOrders.routes.js';
import menuItemsRoutes from './menuItems.routes.js';
import roomImagesRoutes from './roomImages.routes.js';
import roomsRoutes from './rooms.routes.js';
import roomTypesRoutes from './roomTypes.routes.js';
import serviceBookingsRoutes from './serviceBookings.routes.js';
import servicesRoutes from './services.routes.js';
import uploadsRoutes from './uploads.routes.js';

const router = Router();

// Áp dụng một lần cho toàn bộ /api/admin, nên route admin nào thêm vào sau cũng được bảo vệ.
router.use(authenticate, requireAdmin);

router.use('/uploads', uploadsRoutes);
router.use('/rooms', roomsRoutes);
router.use('/room-images', roomImagesRoutes);
router.use('/room-types', roomTypesRoutes);
router.use('/amenities', amenitiesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/services', servicesRoutes);
router.use('/service-bookings', serviceBookingsRoutes);
router.use('/menu-items', menuItemsRoutes);
router.use('/food-orders', foodOrdersRoutes);

export default router;
