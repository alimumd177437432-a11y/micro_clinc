import { notificationModel } from "../modules/models/notification_model.js";

let _io = null;

// يُستدعى مرة وحدة من server.js عشان يحفظ الـ io
export const setIO = (io) => { _io = io; };

// الدالة الرئيسية — تحفظ الإشعار وتبعثه بالـ Socket فوراً
export const sendNotification = async ({ userId, title, body, type, appointmentId }) => {
  // 1. احفظ في الداتابيز
  const notification = await notificationModel.create({
    userId, title, body, type, appointmentId,
  });

  // 2. ابعث بالـ Socket فوراً لو المستخدم أونلاين
  if (_io) {
    _io.to(`user_${userId}`).emit("new_notification", {
      _id: notification._id,
      title,
      body,
      type,
      appointmentId,
      isRead: false,
      createdAt: notification.createdAt,
    });
  }

  console.log(`🔔 إشعار أُرسل لـ ${userId}: ${title}`);
  return notification;
};