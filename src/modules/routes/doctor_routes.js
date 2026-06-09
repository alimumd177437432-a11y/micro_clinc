import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getMyProfile, updateDoctorProfile } from "../controler/doctor_controler.js";
import { updateDoctorSchema } from "../../middelwares.js/schemas.js";
import { validate } from "../../middelwares.js/validate.js";

const doctorRouter = Router();
doctorRouter.use(authentication, authoriziation("doctor"));

/**
 * @swagger
 * /doctor:
 *   put:
 *     summary: تعديل بروفايل الدكتور
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty: { type: string, example: عيون }
 *               bio: { type: string, example: دكتور متخصص في أمراض العيون }
 *               consultationFee: { type: number, example: 50 }
 *               workingDays:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Sunday", "Monday", "Tuesday"]
 *               startTime: { type: string, example: "09:00" }
 *               endTime: { type: string, example: "17:00" }
 *     responses:
 *       200:
 *         description: تم التحديث بنجاح
 */
doctorRouter.put("/", validate(updateDoctorSchema), updateDoctorProfile);

/**
 * @swagger
 * /doctor/profile:
 *   get:
 *     summary: جلب بروفايل الدكتور الحالي
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: بروفايل الدكتور مع السلوتس
 */
doctorRouter.get("/profile", getMyProfile);

export default doctorRouter;