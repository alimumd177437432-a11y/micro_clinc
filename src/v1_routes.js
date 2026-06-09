// v1_routes.js
import { Router } from "express";
import authRouter from "./modules/routes/auth_routes.js";
import adminRouter from "./modules/routes/admin_routes.js";
import doctorRouter from "./modules/routes/doctor_routes.js";
import patientRouter from "./modules/routes/patient_routes.js";
import webhookRouter from "./modules/routes/payment_routes.js";
import { authentication } from "./middelwares.js/auth_middelwares.js";
import prescriptionRouter from "./modules/routes/prescription_routes.js";
import messageRouter from "./modules/routes/message_routes.js";
import notificationRouter from "./modules/routes/notification_routes.js";
import { upload, uploadImageToCloudinary } from "./services/uploadService.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/doctor", doctorRouter);
v1Router.use("/patient", patientRouter);
v1Router.use("/webhooks", webhookRouter);
v1Router.use("/prescription", prescriptionRouter);
v1Router.use("/message", messageRouter);
v1Router.use("/notifications", notificationRouter);

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: رفع صورة إلى Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: ملف الصورة (jpg, png, gif, webp - حد أقصى 5MB)
 *     responses:
 *       200:
 *         description: تم رفع الصورة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: خطأ في رفع الصورة (حجم كبير أو نوع غير مدعوم)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: غير مصرح - التوكن مطلوب
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: حجم الصورة يتجاوز 5MB
 */
v1Router.post("/upload/image", 
  authentication, 
  upload.single("image"), 
  uploadImageToCloudinary, 
  (req, res) => {
    res.status(200).json({
      status: "success",
      data: { imageUrl: req.imageUrl }
    });
  }
);

export { v1Router };