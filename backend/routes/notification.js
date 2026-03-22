import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMyNotifications, markNotificationAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationAsRead);

export default router;
