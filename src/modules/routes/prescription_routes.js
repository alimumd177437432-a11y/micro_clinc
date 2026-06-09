import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { endSessionAndSendPrescription, getMyPrescriptions, getPrescriptionByAppointment } from "../controler/prescription_controller.js";
import { validate } from "../../middelwares.js/validate.js";
import { prescriptionSchema } from "../../middelwares.js/schemas.js";

const prescriptionRouter = Router();
prescriptionRouter.use(authentication);

/**
 * @swagger
 * /prescription/appointments/{appointmentId}/end-session:
 *   post:
 *     summary: إنهاء الجلسة وإرسال الروشتة
 *     description: |
 *       الدكتور ينهي الجلسة ويرسل الروشتة. بعد هذا الـ endpoint:
 *       - ✅ الروشتة تُحفظ في الداتابيز
 *       - ✅ الحجز يتغير إلى **completed**
 *       - ✅ إيميل يُرسل للمريض
 *       - ✅ الشات يُغلق تلقائياً
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diagnosis, medications]
 *             properties:
 *               diagnosis:
 *                 type: string
 *                 example: التهاب ملتحمة العين الحاد
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name, dosage, frequency]
 *                   properties:
 *                     name: { type: string, example: قطرة توبرادكس }
 *                     dosage: { type: string, example: نقطة واحدة }
 *                     frequency: { type: string, example: 3 مرات يومياً لمدة أسبوع }
 *     responses:
 *       201:
 *         description: تم إنهاء الجلسة وإرسال الروشتة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescription: { $ref: '#/components/schemas/Prescription' }
 *       403:
 *         description: هذا الحجز ليس لك
 *       404:
 *         description: الحجز غير موجود
 */
prescriptionRouter.post("/appointments/:appointmentId/end-session", authoriziation("doctor"), validate(prescriptionSchema), endSessionAndSendPrescription);

/**
 * @swagger
 * /prescription/appointments/{appointmentId}:
 *   get:
 *     summary: جلب روشتة حجز معين
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: الروشتة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescription: { $ref: '#/components/schemas/Prescription' }
 *       404:
 *         description: لا توجد روشتة لهذا الحجز
 */
prescriptionRouter.get("/appointments/:appointmentId", authoriziation("doctor"), getPrescriptionByAppointment);

/**
 * @swagger
 * /prescription/my-prescriptions:
 *   get:
 *     summary: الملف الطبي — كل روشتاتي
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الروشتات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results: { type: number, example: 3 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescriptions:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Prescription' }
 */
prescriptionRouter.get("/my-prescriptions", authoriziation("patient"), getMyPrescriptions);

export default prescriptionRouter;