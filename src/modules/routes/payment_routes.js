import { Router } from "express";
import { handleStripeWebhook, paymentSuccess, paymentCancel } from "../controler/payment_controler.js";

const webhookRouter = Router();

/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     summary: Stripe Webhook endpoint
 *     tags: [Payment]
 *     description: |
 *       يستقبل أحداث Stripe تلقائياً — **لا تستدعيه يدوياً**.
 *       بعد إتمام الدفع Stripe يرسل حدث `checkout.session.completed` لهذا الـ endpoint
 *       فيتحدث الحجز تلقائياً إلى `paymentStatus: "paid"`.
 *     responses:
 *       200:
 *         description: تم استلام الحدث
 */
webhookRouter.post("/stripe", handleStripeWebhook);

/**
 * @swagger
 * /webhooks/payment-success:
 *   get:
 *     summary: صفحة نجاح الدفع
 *     tags: [Payment]
 *     description: Stripe يعيد توجيه المستخدم لهذا الرابط بعد الدفع الناجح
 *     parameters:
 *       - in: query
 *         name: appointmentId
 *         schema: { type: string }
 *         description: معرف الحجز
 *     responses:
 *       200:
 *         description: تفاصيل الحجز بعد الدفع
 */
webhookRouter.get("/payment-success", paymentSuccess);

/**
 * @swagger
 * /webhooks/payment-cancel:
 *   get:
 *     summary: صفحة إلغاء الدفع
 *     tags: [Payment]
 *     description: Stripe يعيد توجيه المستخدم لهذا الرابط إذا ألغى الدفع
 *     parameters:
 *       - in: query
 *         name: appointmentId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: رسالة إلغاء الدفع
 */
webhookRouter.get("/payment-cancel", paymentCancel);

export default webhookRouter;