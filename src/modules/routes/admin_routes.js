// admin_routes.js
import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getAdminDashboard, getAllUsers, promoteToDoctor } from "../controler/admin_controler.js";

const adminRouter = Router();

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: جلب كل المستخدمين
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة المستخدمين
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 results: { type: number }
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/User' }
 */
adminRouter.get("/", authentication, authoriziation("admin"), getAllUsers);

/**
 * @swagger
 * /admin/promote-doctor:
 *   post:
 *     summary: ترقية مستخدم إلى دكتور
 *     description: |
 *       يقوم الأدمن بترقية مستخدم عادي إلى دكتور.
 *       **ملاحظة:** النظام يقوم تلقائياً بإنشاء بروفايل الدكتور الفارغ.
 *       الحقول specialty و consultationFee يتم إدخالها لاحقاً من خلال PUT /doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: ahmed@example.com
 *                 description: الإيميل الخاص بالمستخدم المراد ترقيته
 *     responses:
 *       200:
 *         description: تمت الترقية بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: تمت ترقية المستخدم إلى طبيب بنجاح }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         name: { type: string }
 *                         email: { type: string }
 *                         role: { type: string }
 *       400:
 *         description: المستخدم دكتور بالفعل أو الإيميل غير موجود
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: غير مصرح
 *       403:
 *         description: ليس لديك صلاحية (يجب أن تكون أدمن)
 */
adminRouter.post("/promote-doctor", authentication, authoriziation("admin"), promoteToDoctor);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: إحصائيات لوحة التحكم
 *     description: إجمالي الإيرادات، عدد المواعيد المدفوعة، إلخ.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: إحصائيات النظام
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminDashboardResponse'
 */
adminRouter.get("/dashboard", authentication, authoriziation("admin"), getAdminDashboard);

export default adminRouter;