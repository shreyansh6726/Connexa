import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  public static async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const notifications = await db.getNotificationsForUser(req.user._id, req.user.role);
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return res.json({ notifications, unreadCount, count: notifications.length });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching notifications.' });
    }
  }

  public static async markRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const { id } = req.params;
      await db.markNotificationRead(id, req.user._id);

      return res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error marking notification read.' });
    }
  }

  public static async markAllRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      await db.markAllReadForUser(req.user._id, req.user.role);
      return res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error marking all notifications read.' });
    }
  }
}
