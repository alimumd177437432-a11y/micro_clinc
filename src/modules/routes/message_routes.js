import { Router } from "express";
import { authentication } from "../../middelwares.js/auth_middelwares.js";
import { getAppointmentMessages, deleteMessage } from "../controler/message_controller.js";

const messageRouter = Router();
messageRouter.use(authentication);

/**
 * @swagger
 * /message/appointment/{appointmentId}:
 *   get:
 *     summary: جلب رسائل موعد معين
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: قائمة الرسائل
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       senderId: { type: object }
 *                       message: { type: string }
 *                       image: { type: string }
 *                       createdAt: { type: string }
 */
messageRouter.get("/appointment/:appointmentId", getAppointmentMessages);

/**
 * @swagger
 * /message/{messageId}:
 *   delete:
 *     summary: حذف رسالة
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: تم حذف الرسالة
 *       403:
 *         description: ليس لديك صلاحية لحذف هذه الرسالة
 */
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;