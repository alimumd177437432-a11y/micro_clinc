import { Router } from "express";
import { authentication } from "../../../middelwares.js/auth_middelwares.js";
import { getAppointmentMessages, deleteMessage } from "../controler/message_controller.js";

const messageRouter = Router();

// جميع Routes تحتاج مصادقة
messageRouter.use(authentication);

// جلب رسائل موعد معين
messageRouter.get("/appointment/:appointmentId", getAppointmentMessages);

// حذف رسالة (للدكتور أو الأدمن)
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;