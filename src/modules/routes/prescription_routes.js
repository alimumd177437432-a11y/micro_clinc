import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { endSessionAndSendPrescription, getMyPrescriptions, getPrescriptionByAppointment } from "../controler/prescription_controller.js";
import { validate } from "../../middelwares.js/validate.js";
import { prescriptionSchema } from "../../middelwares.js/schemas.js";


const prescriptionRouter = Router();

prescriptionRouter.use(authentication);

prescriptionRouter.post("/appointments/:appointmentId/end-session", authoriziation("doctor"), validate(prescriptionSchema), endSessionAndSendPrescription);
prescriptionRouter.get("/appointments/:appointmentId", authoriziation("doctor"), getPrescriptionByAppointment);
prescriptionRouter.get("/my-prescriptions", authoriziation("patient"), getMyPrescriptions);

export default prescriptionRouter;