import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { doctorDetailsModel } from "../models/Doctor_model.js";

// ── دالة تحويل الساعات إلى فترات (Time Slots Generator Helper) ──
const generateSlots = (start, end) => {
  const slots = [];
  
  let current = parseInt(start.split(":")[0]) * 60 + parseInt(start.split(":")[1]);
  const stop = parseInt(end.split(":")[0]) * 60 + parseInt(end.split(":")[1]);

  while (current < stop) {
    const hours = Math.floor(current / 60).toString().padStart(2, "0");
    const minutes = (current % 60).toString().padStart(2, "0");
        slots.push({
      time: `${hours}:${minutes}`,
      isBooked: false
    });

    current += 30; 
  }

  return slots;
};


// ── 1. دالة إكمال وتحديث ملف الطبيب والـ Slots ──────────────────
export const updateDoctorProfile = ErrorHandler(async (req, res) => {
  const { specialty, consultationFee, bio, workingDays, startTime, endTime } = req.body;
  const doctorId = req.user.id;

  if (!specialty || !consultationFee || !startTime || !endTime) {
    throw new SendError(400, "يرجى ملء الحقول الأساسية: التخصص، السعر، وساعات العمل");
  }

  const existingSpecialty = await doctorDetailsModel.findOne({
    specialty: specialty,
    userId: { $ne: doctorId } 
  });

  if (existingSpecialty) {
    throw new SendError(400, "عذراً، هذا التخصص مشغول حالياً بطبيب آخر في العيادة");
  }

  const generatedSlots = generateSlots(startTime, endTime);

  const updatedProfile = await doctorDetailsModel.findOneAndUpdate(
    { userId: doctorId }, 
    {
      specialty,
      consultationFee,
      bio,
      workingDays,
      startTime,
      endTime,
      slots: generatedSlots 
    },
    { new: true, runValidators: true } 
  );

  if (!updatedProfile) {
    throw new SendError(404, "لم يتم العثور على بروفايل لهذا الطبيب");
  }

  res.status(200).json({
    status: "success",
    message: "تم تحديث ملفك الطبي وتوليد مواعيد العيادة بنجاح",
    data: { profile: updatedProfile }
  });
});


export const getMyProfile = ErrorHandler(async (req, res) => {
  const doctorId = req.user.id;
  const profile = await doctorDetailsModel.findOne({ userId: doctorId })
    .populate("userId", "name email role gender");

  if (!profile) {
    throw new SendError(404, "بروفايل الطبيب غير موجود");
  }

  res.status(200).json({
    status: "success",
    data: { profile }
  });
});