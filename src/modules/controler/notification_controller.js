import { notificationModel } from "../models/Notification_model.js";
import { ErrorHandler } from "../../services/errorhanderler.js";

// جيب إشعاراتي
export const getMyNotifications = ErrorHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await notificationModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await notificationModel.countDocuments({ userId, isRead: false });

  res.status(200).json({
    status: "success",
    unreadCount,
    data: { notifications },
  });
});

// اقرأ كل الإشعارات
export const markAllAsRead = ErrorHandler(async (req, res) => {
  await notificationModel.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    status: "success",
    message: "تم تحديد كل الإشعارات كمقروءة",
  });
});