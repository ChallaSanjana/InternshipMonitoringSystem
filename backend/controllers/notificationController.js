import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id, role: req.user.role })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    role: req.user.role,
    isRead: false
  });

  res.json({
    success: true,
    notifications,
    unreadCount
  });
};

export const markNotificationAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification || notification.userId.toString() !== req.user.id || notification.role !== req.user.role) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    role: req.user.role,
    isRead: false
  });

  return res.json({
    success: true,
    notification,
    unreadCount
  });
};
