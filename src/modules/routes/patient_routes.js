import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import { getAllDoctors, getDoctorById, bookAppointment, cancelAppointment, getMyAppointments } from "../controler/patient_controler.js";
import { createCheckoutSession } from "../controler/payment_controler.js";
import { bookAppointmentSchema } from "../../middelwares.js/schemas.js";
import { validate } from "../../middelwares.js/validate.js";


const patientRouter = Router();

patientRouter.use(authentication);

patientRouter.get("/doctors", getAllDoctors);
patientRouter.get("/doctors/:doctorId", getDoctorById);

patientRouter.post("/appointments", authoriziation("patient"), validate(bookAppointmentSchema), bookAppointment);
patientRouter.delete("/appointments/:appointmentId", authoriziation("patient"), cancelAppointment);
patientRouter.get("/appointments", authoriziation("patient"), getMyAppointments);
patientRouter.post("/:appointmentId/", authoriziation("patient"), createCheckoutSession);

export default patientRouter;