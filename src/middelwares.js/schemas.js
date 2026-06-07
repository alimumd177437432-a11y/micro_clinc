import Joi from "joi";

// ── Auth
export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "الاسم يجب أن يكون حرفين على الأقل",
    "string.max": "الاسم يجب ألا يتجاوز 50 حرف",
    "any.required": "الاسم مطلوب",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "البريد الإلكتروني غير صحيح",
    "any.required": "البريد الإلكتروني مطلوب",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "any.required": "كلمة المرور مطلوبة",
  }),
  role: Joi.string().valid("patient", "doctor").required().messages({
    "any.only": "الدور يجب أن يكون patient أو doctor",
    "any.required": "الدور مطلوب",
  }),
  phone: Joi.string().optional(),
  gender: Joi.string().valid("male", "female").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "البريد الإلكتروني غير صحيح",
    "any.required": "البريد الإلكتروني مطلوب",
  }),
  password: Joi.string().required().messages({
    "any.required": "كلمة المرور مطلوبة",
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "البريد الإلكتروني غير صحيح",
    "any.required": "البريد الإلكتروني مطلوب",
  }),
});

export const newPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "any.required": "كلمة المرور الجديدة مطلوبة",
  }),
});

// ── Patient
export const bookAppointmentSchema = Joi.object({
  doctorUserId: Joi.string().length(24).required().messages({
    "string.length": "معرف الطبيب غير صحيح",
    "any.required": "معرف الطبيب مطلوب",
  }),
  slotId: Joi.string().length(24).required().messages({
    "string.length": "معرف الوقت غير صحيح",
    "any.required": "معرف الوقت مطلوب",
  }),
  date: Joi.string().isoDate().required().messages({
    "string.isoDate": "التاريخ غير صحيح، استخدم YYYY-MM-DD",
    "any.required": "التاريخ مطلوب",
  }),
});

// ── Doctor
export const updateDoctorSchema = Joi.object({
  specialty: Joi.string().min(2).optional(),
  bio: Joi.string().max(500).optional(),
  consultationFee: Joi.number().min(0).optional().messages({
    "number.min": "رسوم الاستشارة يجب أن تكون موجبة",
  }),
  workingDays: Joi.array().items(Joi.string()).optional(),
  startTime: Joi.string().optional(),
  endTime: Joi.string().optional(),
  slots: Joi.array().optional(),
});

// ── Prescription
export const prescriptionSchema = Joi.object({
  diagnosis: Joi.string().min(3).required().messages({
    "string.min": "التشخيص يجب أن يكون 3 أحرف على الأقل",
    "any.required": "التشخيص مطلوب",
  }),
  medications: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().messages({ "any.required": "اسم الدواء مطلوب" }),
        dosage: Joi.string().required().messages({ "any.required": "الجرعة مطلوبة" }),
        frequency: Joi.string().required().messages({ "any.required": "التكرار مطلوب" }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "أدخل دواء واحد على الأقل",
      "any.required": "الأدوية مطلوبة",
    }),
});