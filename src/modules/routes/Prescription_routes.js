import { Router } from "express";
import { authentication, authoriziation } from "../../middelwares.js/auth_middelwares.js";
import {
  endSessionAndSendPrescription,
  getMyPrescriptions,
  getPrescriptionByAppointment,
} from "../controler/prescription_controller.js";

const prescriptionRouter = Router();

prescriptionRouter.use(authentication);

prescriptionRouter.post(
  "/appointments/:appointmentId/end-session",
  authoriziation("doctor"),
  endSessionAndSendPrescription
);

prescriptionRouter.get(
  "/appointments/:appointmentId",
  authoriziation("doctor"),
  getPrescriptionByAppointment
);

// المريض — يشوف كل روشتاته (الملف الطبي)
prescriptionRouter.get(
  "/my-prescriptions",
  authoriziation("patient"),
  getMyPrescriptions
);

export default prescriptionRouter;