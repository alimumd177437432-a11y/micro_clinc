import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getMyProfile, updateDoctorProfile } from "../controler/doctor_controler.js";
const doctorRouter = Router();


doctorRouter.use(authentication, authoriziation("doctor"));

doctorRouter.put("/", updateDoctorProfile);

doctorRouter.get("/profile", getMyProfile);

export default doctorRouter;