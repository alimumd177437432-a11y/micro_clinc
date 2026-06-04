import { prescriptionModel } from "../models/Prescription_model.js";
import { appointmentModel } from "../models/Appointment_model.js";
import { userModel } from "../models/user_model.js";
import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { sendPrescriptionEmail } from "../../utils/nodemailer/prescriptionemail.js";

// ── الدكتور ينهي الجلسة ويرسل الروشتة
export const endSessionAndSendPrescription = ErrorHandler(async (req, res) => {
  const doctorId = req.user.id;
  const { appointmentId } = req.params;
  const { diagnosis, medications } = req.body;

  // التحقق من البيانات
  if (!diagnosis) throw new SendError(400, "التشخيص مطلوب");
  if (!medications || medications.length === 0) throw new SendError(400, "أدخل دواء واحد على الأقل");

  // جلب الحجز
  const appointment = await appointmentModel
    .findById(appointmentId)
    .populate("patientId", "name email")
    .populate("doctorId", "name");

  if (!appointment) throw new SendError(404, "الحجز غير موجود");
  if (appointment.doctorId._id.toString() !== doctorId) throw new SendError(403, "هذا الحجز ليس لك");
  if (appointment.status !== "confirmed") throw new SendError(400, "الحجز ليس في حالة مؤكدة");

  // 1. إنشاء الروشتة في الداتابيز
  const prescription = await prescriptionModel.create({
    appointmentId,
    patientId: appointment.patientId._id,
    doctorId: appointment.doctorId._id,
    diagnosis,
    medications,
  });

  // 2. تحديث الحجز إلى completed
  appointment.status = "completed";
  await appointment.save();

  // 3. إرسال الإيميل للمريض
  await sendPrescriptionEmail({
    patientEmail: appointment.patientId.email,
    patientName: appointment.patientId.name,
    doctorName: appointment.doctorId.name,
    diagnosis,
    medications,
    appointmentDate: appointment.date,
  });

  res.status(201).json({
    status: "success",
    message: "تم إنهاء الجلسة وإرسال الروشتة بنجاح ✅",
    data: { prescription },
  });
});

// ── المريض يشوف روشتته
export const getMyPrescriptions = ErrorHandler(async (req, res) => {
  const patientId = req.user.id;

  const prescriptions = await prescriptionModel
    .find({ patientId })
    .populate("doctorId", "name")
    .populate("appointmentId", "date timeSlot")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: prescriptions.length,
    data: { prescriptions },
  });
});

// ── الدكتور يشوف روشتة حجز معين
export const getPrescriptionByAppointment = ErrorHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const prescription = await prescriptionModel
    .findOne({ appointmentId })
    .populate("patientId", "name email")
    .populate("doctorId", "name");

  if (!prescription) throw new SendError(404, "لا توجد روشتة لهذا الحجز");

  res.status(200).json({
    status: "success",
    data: { prescription },
  });
});