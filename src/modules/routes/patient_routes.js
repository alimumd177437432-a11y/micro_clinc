import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getAllDoctors, getDoctorById, bookAppointment, cancelAppointment, getMyAppointments } from "../controler/patient_controler.js";
import { createCheckoutSession } from "../controler/payment_controler.js";
import { validate } from "../../middelwares.js/validate.js";
import { bookAppointmentSchema } from "../../middelwares.js/schemas.js";

const patientRouter = Router();
patientRouter.use(authentication);

/**
 * @swagger
 * /patient/doctors:
 *   get:
 *     summary: جلب كل الأطباء
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الأطباء
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     doctors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id: { type: string }
 *                           specialty: { type: string, example: عيون }
 *                           consultationFee: { type: number, example: 50 }
 *                           userId:
 *                             type: object
 *                             properties:
 *                               name: { type: string }
 *                               email: { type: string }
 */
patientRouter.get("/doctors", getAllDoctors);

/**
 * @swagger
 * /patient/doctors/{doctorId}:
 *   get:
 *     summary: جلب طبيب معين مع السلوتس المتاحة
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string }
 *         description: الـ userId للطبيب
 *     responses:
 *       200:
 *         description: بيانات الطبيب والأوقات المتاحة
 *       404:
 *         description: الطبيب غير موجود
 */
patientRouter.get("/doctors/:doctorId", getDoctorById);

/**
 * @swagger
 * /patient/appointments:
 *   post:
 *     summary: حجز موعد
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorUserId, slotId, date]
 *             properties:
 *               doctorUserId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               slotId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d2
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-10"
 *     responses:
 *       201:
 *         description: تم الحجز بنجاح — أكمل الدفع
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment: { $ref: '#/components/schemas/Appointment' }
 *                     appointmentId: { type: string }
 *                     nextStep: { type: string, example: payment }
 *       400:
 *         description: الوقت محجوز مسبقاً
 */
patientRouter.post("/appointments", authoriziation("patient"), validate(bookAppointmentSchema), bookAppointment);

/**
 * @swagger
 * /patient/appointments/{appointmentId}:
 *   delete:
 *     summary: إلغاء حجز
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: تم الإلغاء بنجاح
 *       400:
 *         description: لا يمكن إلغاء حجز مدفوع
 */
patientRouter.delete("/appointments/:appointmentId", authoriziation("patient"), cancelAppointment);

/**
 * @swagger
 * /patient/appointments:
 *   get:
 *     summary: جلب مواعيدي
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة المواعيد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointments:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Appointment' }
 */
patientRouter.get("/appointments", authoriziation("patient"), getMyAppointments);

/**
 * @swagger
 * /patient/{appointmentId}:
 *   post:
 *     summary: إنشاء جلسة دفع Stripe
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: تم إنشاء جلسة الدفع
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkoutUrl:
 *                       type: string
 *                       example: https://checkout.stripe.com/c/pay/cs_test_...
 *                     sessionId: { type: string }
 *       400:
 *         description: تم الدفع مسبقاً أو رسوم غير محددة
 */
patientRouter.post("/:appointmentId/", authoriziation("patient"), createCheckoutSession);

export default patientRouter;