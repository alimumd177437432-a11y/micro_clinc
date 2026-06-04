import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { messageModel } from "../models/Message_model.js";
import { appointmentModel } from "../models/Appointment_model.js";

// جلب محادثة موعد معين
export const getAppointmentMessages = ErrorHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // التحقق من صحة الموعد وصلاحية المستخدم
  const appointment = await appointmentModel.findById(appointmentId);

  if (!appointment) {
    throw new SendError(404, "الموعد غير موجود");
  }

  const isPatient = userRole === "patient" && appointment.patientId.toString() === userId;
  const isDoctor = userRole === "doctor" && appointment.doctorId.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    throw new SendError(403, "ليس لديك صلاحية لعرض هذه المحادثة");
  }

  const messages = await messageModel.find({ appointmentId })
    .sort({ createdAt: 1 })
    .populate("senderId", "name role email");

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: { messages }
  });
});

// حذف رسالة (للدكتور والأدمن فقط)
export const deleteMessage = ErrorHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const message = await messageModel.findById(messageId);
  
  if (!message) {
    throw new SendError(404, "الرسالة غير موجودة");
  }

  const appointment = await appointmentModel.findById(message.appointmentId);
  
  const isDoctor = userRole === "doctor" && appointment.doctorId.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isDoctor && !isAdmin) {
    throw new SendError(403, "ليس لديك صلاحية لحذف هذه الرسالة");
  }

  await message.deleteOne();

  res.status(200).json({
    status: "success",
    message: "تم حذف الرسالة بنجاح"
  });
});