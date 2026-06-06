import { Router } from "express";
import { authentication } from "../../middelwares.js/auth_middelwares.js";
import { getMyNotifications, markAllAsRead } from "../controler/notification_controller.js";

const notificationRouter = Router();

notificationRouter.use(authentication);

notificationRouter.get("/", getMyNotifications);
notificationRouter.patch("/read-all", markAllAsRead);

export default notificationRouter;