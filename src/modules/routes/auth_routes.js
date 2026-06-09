import { Router } from "express";
import { addForResetPassword, getMyAcountData, login, newpassword, refreshAccessToken, signup, updateAcount, updatePassword } from "../controler/user_controler.js";
import { authentication } from "../../middelwares.js/auth_middelwares.js";
import { validate } from "../../middelwares.js/validate.js";
import { authLimiter } from "../../middelwares.js/rateLimiter.js";
import { signupSchema, loginSchema, resetPasswordSchema, newPasswordSchema } from "../../middelwares.js/schemas.js";

const authRouter = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: تسجيل مستخدم جديد
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role, phone, gender]
 *             properties:
 *               name:
 *                 type: string
 *                 example: محمد أحمد
 *               email:
 *                 type: string
 *                 example: mohammed@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [patient, doctor]
 *                 example: patient
 *               phone:
 *                 type: string
 *                 example: "0532655235"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *     responses:
 *       201:
 *         description: تم التسجيل بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: بيانات غير صحيحة
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
authRouter.post("/signup", authLimiter, validate(signupSchema), signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: mohammed@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 token: { type: string, example: eyJhbGci... }
 *                 refreshToken: { type: string, example: eyJhbGci... }
 *       400:
 *         description: بيانات غير صحيحة
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
authRouter.post("/login", authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: تجديد التوكن
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: تم تجديد التوكن
 */
authRouter.post("/refresh-token", refreshAccessToken);

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: جلب بيانات حسابي
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: بيانات المستخدم
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: غير مصرح
 */
authRouter.get("/", authentication, getMyAcountData);

/**
 * @swagger
 * /auth:
 *   put:
 *     summary: تعديل بيانات الحساب
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               birthDate: { type: string, format: date }
 *     responses:
 *       200:
 *         description: تم التعديل بنجاح
 */
authRouter.put("/", authentication, updateAcount);

/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: تغيير كلمة المرور
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password: { type: string, example: newpassword123 }
 *     responses:
 *       200:
 *         description: تم تغيير كلمة المرور
 */
authRouter.put("/password", authentication, updatePassword);

/**
 * @swagger
 * /auth/ask-reset-password:
 *   post:
 *     summary: طلب إعادة تعيين كلمة المرور
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: mohammed@example.com }
 *     responses:
 *       200:
 *         description: تم إرسال رمز التحقق على البريد الإلكتروني
 */
authRouter.post("/ask-reset-password", authLimiter, validate(resetPasswordSchema), addForResetPassword);

/**
 * @swagger
 * /auth/reset-password/{otpToken}:
 *   post:
 *     summary: إعادة تعيين كلمة المرور
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: otpToken
 *         required: true
 *         schema: { type: string }
 *         description: التوكن المُرسل على البريد
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword: { type: string, example: newpassword123 }
 *     responses:
 *       200:
 *         description: تم إعادة تعيين كلمة المرور
 */
authRouter.post("/reset-password/:otpToken", validate(newPasswordSchema), newpassword);

export default authRouter;