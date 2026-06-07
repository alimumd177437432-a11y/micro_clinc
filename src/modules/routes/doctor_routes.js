import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getMyProfile, updateDoctorProfile } from "../controler/doctor_controler.js";
import { updateDoctorSchema } from "../../middelwares.js/schemas.js";
import { validate } from "../../middelwares.js/validate.js";


const doctorRouter = Router();

doctorRouter.use(authentication, authoriziation("doctor"));

doctorRouter.put("/", validate(updateDoctorSchema), updateDoctorProfile);
doctorRouter.get("/profile", getMyProfile);

export default doctorRouter;