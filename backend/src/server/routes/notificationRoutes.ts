import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, NotificationController.getNotifications);
router.put('/read-all', authMiddleware, NotificationController.markAllRead);
router.put('/:id/read', authMiddleware, NotificationController.markRead);

export default router;
