import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import {
  listMyNotificationsValidator,
  notificationIdValidator,
} from '../validators/notifications.validator.js';

const router = Router();

// Khách và admin đều dùng; mỗi người chỉ thấy thông báo của mình.
router.use(authenticate);

router.get('/', listMyNotificationsValidator, validate, notificationsController.getMyNotifications);
// Địa chỉ cố định đứng trước địa chỉ có tham số.
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationIdValidator, validate, notificationsController.markRead);

export default router;
