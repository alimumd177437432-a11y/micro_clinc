import { Router } from "express";

import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getAdminDashboard, getAllUsers, promoteToDoctor } from "../controler/admin_controler.js";

const adminRouter = Router();

adminRouter.get("/",authentication,authoriziation("admin") ,getAllUsers); 

adminRouter.post("/promote-doctor",authentication,authoriziation("admin") ,promoteToDoctor); 

adminRouter.get("/dashboard",authentication,authoriziation("admin"),getAdminDashboard);



export default adminRouter;