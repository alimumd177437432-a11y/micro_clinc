import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { doctorDetailsModel } from "../models/Doctor_model.js";
import { appointmentModel } from "../models/Appointment_model.js";
import { userModel } from "../models/user_model.js";

// ── 1. (جلب كل الأطباء مع تخصصاته)
export const getAllDoctors = ErrorHandler(async (req, res) => {
  const doctors = await doctorDetailsModel
    .find({})
    .select("-slots")
    .populate("userId", "name email gender");

  if (!doctors || doctors.length === 0) {
    throw new SendError(404, "لا يوجد أطباء متاحون حالياً");
  }

  res.status(200).json({
    status: "success",
    data: { doctors },
  });
});

// ── 2. جلب بيانات طبيب معين مع السلوتس المتاحة فقط 
export const getDoctorById = ErrorHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await doctorDetailsModel
    .findOne({ userId: doctorId })
    .populate("userId", "name email gender phone");

  if (!doctor) {
    throw new SendError(404, "الطبيب غير موجود");
  }

  const availableSlots = doctor.slots.filter((slot) => !slot.isBooked);

  res.status(200).json({
    status: "success",
    data: {
      doctor: {
        _id: doctor._id,
        userId: doctor.userId,
        specialty: doctor.specialty,
        consultationFee: doctor.consultationFee,
        bio: doctor.bio,
        workingDays: doctor.workingDays,
        startTime: doctor.startTime,
        endTime: doctor.endTime,
      },
      availableSlots,
    },
  });
});

// ── 3. حجز موعد (الخطوة الرئيسية) 
export const bookAppointment = ErrorHandler(async (req, res) => {
  const patientId = req.user.id;
  const { doctorUserId, slotId, date } = req.body;

  if (!doctorUserId || !slotId || !date) {
    throw new SendError(400, "يرجى تحديد الطبيب والوقت والتاريخ");
  }

  const doctorProfile = await doctorDetailsModel.findOne({ userId: doctorUserId });

  if (!doctorProfile) {
    throw new SendError(404, "الطبيب غير موجود");
  }

  const slotIndex = doctorProfile.slots.findIndex(
    (slot) => slot._id.toString() === slotId
  );

  if (slotIndex === -1) {
    throw new SendError(404, "الوقت المحدد غير موجود");
  }

  const slot = doctorProfile.slots[slotIndex];

  if (slot.isBooked) {
    throw new SendError(400, "هذا الوقت محجوز بالفعل، يرجى اختيار وقت آخر");
  }

  doctorProfile.slots[slotIndex].isBooked = true;
  await doctorProfile.save();

  const appointment = await appointmentModel.create({
    patientId,
    doctorId: doctorUserId,
    date: new Date(date),
    timeSlot: slot.time,
    status: "confirmed",
    paymentStatus: "unpaid",
  });

  res.status(201).json({
    status: "success",
    message: "تم تأكيد حجزك بنجاح، يرجى إتمام الدفع",
    data: {
      appointment,
      nextStep: "payment",
      appointmentId: appointment._id,
    },
  });
});

// ── 4. إلغاء حجز (يُعيد السلوت للمتاح) 
export const cancelAppointment = ErrorHandler(async (req, res) => {
  const patientId = req.user.id;
  const { appointmentId } = req.params;
  const appointment = await appointmentModel.findById(appointmentId);

  if (!appointment) {
    throw new SendError(404, "الحجز غير موجود");
  }

  if (appointment.patientId.toString() !== patientId) {
    throw new SendError(403, "ليس لديك صلاحية لإلغاء هذا الحجز");
  }

  if (appointment.paymentStatus === "paid") {
    throw new SendError(400, "لا يمكن إلغاء حجز تم دفعه، يرجى التواصل مع الإدارة");
  }

  // إعادة السلوت للمتاح في بروفايل الطبيب
  const doctorProfile = await doctorDetailsModel.findOne({
    userId: appointment.doctorId,
  });

  if (doctorProfile) {
    const slotIndex = doctorProfile.slots.findIndex(
      (slot) => slot.time === appointment.timeSlot
    );
    if (slotIndex !== -1) {
      doctorProfile.slots[slotIndex].isBooked = false;
      await doctorProfile.save();
    }
  }

appointment.status = "cancelled";
await appointment.save();

  res.status(200).json({
    status: "success",
    message: "تم إلغاء الحجز بنجاح وأُعيد الوقت للمواعيد المتاحة",
  });
});

// ── 5. جلب حجوزات المريض 
export const getMyAppointments = ErrorHandler(async (req, res) => {
  const patientId = req.user.id;

  const appointments = await appointmentModel
    .find({ patientId })
    .populate("doctorId", "name email")
    .sort({ date: -1 });

  res.status(200).json({
    status: "success",
    data: { appointments },
  });
});