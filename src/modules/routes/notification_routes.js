import { Router } from "express";
import { authentication } from "../../middelwares.js/auth_middelwares.js";
import { getMyNotifications, markAllAsRead } from "../controler/notification_controller.js";

const notificationRouter = Router();
notificationRouter.use(authentication);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: جلب إشعاراتي
 *     description: يرجع آخر 20 إشعار مع عدد الغير مقروءة
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الإشعارات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 unreadCount: { type: number, example: 3 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Notification' }
 */
notificationRouter.get("/", getMyNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: تحديد كل الإشعارات كمقروءة
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تحديد كل الإشعارات كمقروءة
 */
notificationRouter.patch("/read-all", markAllAsRead);

export default notificationRouter;