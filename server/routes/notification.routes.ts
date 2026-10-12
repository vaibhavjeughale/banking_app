import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

export const notificationRouter = Router();
notificationRouter.use(authMiddleware);

// GET /api/v1/notifications
notificationRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifications = db.getNotificationsByUserId(user.id);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return res.json({
    notifications,
    unreadCount
  });
});

// PATCH /api/v1/notifications/:notificationId/read
notificationRouter.patch('/:notificationId/read', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { notificationId } = req.params;

  const success = db.markNotificationAsRead(notificationId, user.id);
  if (!success) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  return res.json({ success: true });
});

// POST /api/v1/notifications/mark-all-read
notificationRouter.post('/mark-all-read', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.markAllNotificationsRead(user.id);
  return res.json({ success: true, message: 'All notifications marked as read' });
});
