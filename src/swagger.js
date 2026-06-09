// swagger.js - نسخة Render (بنفس هيكلك)
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🏥 عيادة الشفاء الرقمية — API",
      version: "2.0.0",
      description: `
## نظرة عامة
API كامل لإدارة العيادة الرقمية يشمل: تسجيل المستخدمين، حجز المواعيد، الدفع عبر Stripe، المحادثة المباشرة عبر Socket.IO، الروشتات الطبية، والإشعارات الفورية.

---

## 🔐 المصادقة والتوكن
جميع الـ endpoints المحمية تحتاج **Bearer Token** في الـ header:
\`\`\`
Authorization: Bearer <TOKEN>
\`\`\`

### كيف يعمل التوكن؟
- عند تسجيل الدخول (\`/auth/login\`) تحصل على \`token\` و \`refreshToken\`
- التوكن يحتوي على: \`id\`, \`name\`, \`email\`, \`role\`, \`phone\`
- الـ APIs التالية **تستخرج المعلومات من التوكن مباشرة** (ما تحتاج ترسل email أو id في الـ body):
  - \`GET /auth\` - جلب بيانات حسابي
  - \`PUT /auth\` - تعديل بيانات حسابي (تستخدم email من التوكن)
  - \`PUT /auth/password\` - تغيير كلمة المرور (تستخدم email من التوكن)
  - \`GET /doctor/profile\` - جلب بروفايلي كدكتور
  - \`PUT /doctor\` - تعديل بروفايلي (تستخدم id من التوكن)
  - \`GET /patient/appointments\` - جلب مواعيدي (تستخدم id من التوكن)
  - \`DELETE /patient/appointments/:appointmentId\` - إلغاء حجزي
  - \`POST /patient/:appointmentId\` - دفع حجزي
  - \`GET /prescription/my-prescriptions\` - جلب روشتاتي
  - \`GET /notifications\` - جلب إشعاراتي
  - \`PATCH /notifications/read-all\` - تحديث إشعاراتي

---

## 💬 نظام الشات (Socket.IO)
الشات يعمل عبر **WebSocket** ولا يمكن اختباره من واجهة Swagger.

### 📡 الاتصال بالخادم
\`\`\`javascript
import { io } from "socket.io-client";

const socket = io("https://micro-clinc.onrender.com", {
  auth: { token: "YOUR_JWT_TOKEN" },
  transports: ["websocket"]
});
\`\`\`

### 📤 Events ترسلها للخادم (Emit)

| Event | البيانات المطلوبة | الوصف |
|-------|------------------|-------|
| \`join_appointment_room\` | \`{ appointmentId: string }\` | الانضمام لغرفة المحادثة |
| \`send_message\` | \`{ appointmentId, message, imageUrl }\` | إرسال رسالة (نص أو صورة) |
| \`typing_start\` | \`{ appointmentId }\` | بدء الكتابة |
| \`typing_stop\` | \`{ appointmentId }\` | التوقف عن الكتابة |
| \`leave_appointment_room\` | \`{}\` | مغادرة الغرفة |
| \`end_session\` | \`{ appointmentId }\` | الدكتور ينهي الجلسة |

### 📥 أحداث تستقبلها من الخادم (Listen)

| Event | البيانات المرسلة | الوصف |
|-------|-----------------|-------|
| \`previous_messages\` | \`{ messages: [...] }\` | تحميل الرسائل السابقة |
| \`receive_message\` | \`{ senderName, senderRole, message, image }\` | استلام رسالة جديدة |
| \`user_joined\` | \`{ userId, name, role }\` | مستخدم دخل الغرفة |
| \`user_left\` | \`{ userId, name }\` | مستخدم غادر الغرفة |
| \`user_typing\` | \`{ userId, name, isTyping }\` | حالة الكتابة |
| \`chat_timer\` | \`{ timeLeft, minutesLeft, secondsLeft, message }\` | مؤقت المحادثة |
| \`chat_timer_update\` | \`{ timeLeft, minutesLeft, secondsLeft, message }\` | تحديث المؤقت |
| \`chat_ended\` | \`{ message }\` | انتهاء المحادثة |
| \`session_ended_by_doctor\` | \`{ message }\` | الدكتور أنهى الجلسة |
| \`new_notification\` | \`{ _id, title, body, type, appointmentId, isRead, createdAt }\` | إشعار فوري |

---

## 🔔 الإشعارات الفورية عبر Socket.IO

الإشعارات تصل تلقائياً عبر Socket.io بعد:
- حجز موعد ✅
- إتمام الدفع 💳
- قبل الموعد بـ 5 دقائق ⏰
- إنهاء الجلسة وإرسال روشتة 📋

---

## 💳 بيانات تجريبية لـ Stripe (Test Mode)

| رقم الكارت | تاريخ الانتهاء | CVV |
|-----------|----------------|-----|
| \`4242 4242 4242 4242\` | أي تاريخ مستقبلي | أي 3 أرقام (دفع ناجح) |
| \`4000 0000 0000 0002\` | أي تاريخ مستقبلي | أي 3 أرقام (رفض الدفع) |

---

## 📋 ملاحظات مهمة

1. **جميع التواريخ** يجب أن تكون بصيغة \`YYYY-MM-DD\`
2. **الـ IDs** كلها من نوع \`ObjectId\` (24 حرف)
3. **رفع الصور**: استخدم endpoint \`/upload/image\` أولاً ثم أرسل الرابط عبر Socket
4. **الروشتة**: تُرسل تلقائياً عبر الإيميل بعد إنهاء الجلسة
5. **التسجيل**: النظام يحدد \`role: "patient"\` تلقائياً - لا ترسل role في الطلب
      `,
      contact: {
        name: "عيادة الشفاء الرقمية",
        email: "support@clinic.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "https://micro-clinc.onrender.com/micro/v1",
        description: "Production Server (Render)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          in: "header",
          name: "token",
          description: "أدخل التوكن مباشرة",
        },
      },
      schemas: {
        // ========== الأساسيات ==========
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "رسالة الخطأ" },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "تمت العملية بنجاح" },
          },
        },

        // ========== المستخدم ==========
        SignupInput: {
          type: "object",
          required: ["name", "email", "password", "phone", "gender"],
          properties: {
            name: { type: "string", example: "محمد أحمد" },
            email: { type: "string", example: "mohammed@example.com" },
            password: { type: "string", example: "123456" },
            phone: { type: "string", example: "0599123456" },
            gender: {
              type: "string",
              enum: ["male", "female"],
              example: "male",
            },
          },
        },

        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "mohammed@example.com" },
            password: { type: "string", example: "123456" },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Login successful" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs...",
            },
            data: { $ref: "#/components/schemas/User" },
          },
        },

        RefreshTokenInput: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs...",
            },
          },
        },

        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name: { type: "string", example: "محمد أحمد" },
            email: { type: "string", example: "mohammed@example.com" },
            role: {
              type: "string",
              enum: ["patient", "doctor", "admin"],
              example: "patient",
            },
            phone: { type: "string", example: "0599123456" },
            gender: {
              type: "string",
              enum: ["male", "female"],
              example: "male",
            },
            birthDate: {
              type: "string",
              format: "date",
              example: "1990-01-01",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        UpdateAccountInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "محمد عبدالله" },
            phone: { type: "string", example: "0599887766" },
            birthDate: {
              type: "string",
              format: "date",
              example: "1990-01-01",
            },
          },
        },

        UpdatePasswordInput: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string", example: "newpassword123" },
          },
        },

        ResetPasswordInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", example: "mohammed@example.com" },
          },
        },

        NewPasswordInput: {
          type: "object",
          required: ["password", "otp"],
          properties: {
            password: { type: "string", example: "newpassword123" },
            otp: { type: "string", example: "123456" },
          },
        },

        // ========== الطبيب ==========
        DoctorProfile: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { $ref: "#/components/schemas/User" },
            specialty: { type: "string", example: "cardiologist" },
            consultationFee: { type: "number", example: 100 },
            bio: { type: "string", example: "استشاري قلب وأوعية دموية" },
            workingDays: {
              type: "array",
              items: { type: "string" },
              example: ["Saturday", "Monday", "Wednesday"],
            },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "17:00" },
            slots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  time: { type: "string", example: "09:00" },
                  isBooked: { type: "boolean", example: false },
                },
              },
            },
          },
        },

        UpdateDoctorProfileInput: {
          type: "object",
          required: ["specialty", "consultationFee", "startTime", "endTime"],
          properties: {
            specialty: { type: "string", example: "cardiologist" },
            consultationFee: { type: "number", example: 150 },
            bio: { type: "string", example: "استشاري أمراض القلب" },
            workingDays: {
              type: "array",
              items: { type: "string" },
              example: ["Sunday", "Tuesday", "Thursday"],
            },
            startTime: { type: "string", example: "10:00" },
            endTime: { type: "string", example: "18:00" },
          },
        },

        // ========== المواعيد ==========
        DoctorListResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                doctors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      specialty: { type: "string" },
                      consultationFee: { type: "number" },
                      userId: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          email: { type: "string" },
                          gender: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        DoctorByIdResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                doctor: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    userId: { $ref: "#/components/schemas/User" },
                    specialty: { type: "string" },
                    consultationFee: { type: "number" },
                    bio: { type: "string" },
                    workingDays: { type: "array", items: { type: "string" } },
                    startTime: { type: "string" },
                    endTime: { type: "string" },
                  },
                },
                availableSlots: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      time: { type: "string" },
                      isBooked: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },

        BookAppointmentInput: {
          type: "object",
          required: ["doctorUserId", "slotId", "date"],
          properties: {
            doctorUserId: {
              type: "string",
              example: "64f1a2b3c4d5e6f7a8b9c0d1",
            },
            slotId: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d2" },
            date: { type: "string", format: "date", example: "2026-06-15" },
          },
        },

        BookAppointmentResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                appointment: { $ref: "#/components/schemas/Appointment" },
                appointmentId: { type: "string" },
                nextStep: { type: "string", example: "payment" },
              },
            },
          },
        },

        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            date: { type: "string", format: "date", example: "2026-06-10" },
            timeSlot: { type: "string", example: "10:00" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "completed", "cancelled"],
              example: "confirmed",
            },
            paymentStatus: {
              type: "string",
              enum: ["unpaid", "paid"],
              example: "paid",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        MyAppointmentsResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                appointments: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
        },

        // ========== الدفع ==========
        CheckoutSessionResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                checkoutUrl: {
                  type: "string",
                  example: "https://checkout.stripe.com/...",
                },
                sessionId: { type: "string" },
              },
            },
          },
        },

        PaymentSuccessResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                appointmentId: { type: "string" },
                patient: { type: "string" },
                doctor: { type: "string" },
                date: { type: "string" },
                timeSlot: { type: "string" },
                paymentStatus: { type: "string" },
                status: { type: "string" },
              },
            },
          },
        },

        // ========== الروشتة ==========
        Prescription: {
          type: "object",
          properties: {
            _id: { type: "string" },
            appointmentId: { type: "string" },
            patientId: { $ref: "#/components/schemas/User" },
            doctorId: { $ref: "#/components/schemas/User" },
            diagnosis: { type: "string", example: "التهاب ملتحمة العين الحاد" },
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "قطرة توبرادكس" },
                  dosage: { type: "string", example: "نقطة واحدة" },
                  frequency: {
                    type: "string",
                    example: "3 مرات يومياً لمدة أسبوع",
                  },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        CreatePrescriptionInput: {
          type: "object",
          required: ["diagnosis", "medications"],
          properties: {
            diagnosis: { type: "string", example: "ارتفاع ضغط الدم" },
            medications: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "dosage", "frequency"],
                properties: {
                  name: { type: "string", example: "لوبريسور" },
                  dosage: { type: "string", example: "50 ملغ" },
                  frequency: { type: "string", example: "مرتين يومياً" },
                },
              },
            },
          },
        },

        MyPrescriptionsResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            results: { type: "number" },
            data: {
              type: "object",
              properties: {
                prescriptions: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Prescription" },
                },
              },
            },
          },
        },

        // ========== الإشعارات ==========
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string", example: "✅ تم حجز موعدك" },
            body: {
              type: "string",
              example: "تم حجز موعدك مع د. أحمد يوم 2026-06-15 الساعة 10:00",
            },
            type: {
              type: "string",
              enum: [
                "booking",
                "payment",
                "reminder",
                "session_start",
                "prescription",
              ],
            },
            isRead: { type: "boolean", default: false },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        NotificationsResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            unreadCount: { type: "number" },
            data: {
              type: "object",
              properties: {
                notifications: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Notification" },
                },
              },
            },
          },
        },

        // ========== الرسائل ==========
        Message: {
          type: "object",
          properties: {
            _id: { type: "string" },
            senderId: { $ref: "#/components/schemas/User" },
            message: { type: "string", nullable: true },
            image: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        MessagesResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            results: { type: "number" },
            data: {
              type: "object",
              properties: {
                messages: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Message" },
                },
              },
            },
          },
        },

        // ========== الإدارة ==========
        PromoteDoctorInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", example: "ahmed@example.com" },
          },
        },

        PromoteDoctorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
        },

        AdminDashboardResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                totalRevenue: { type: "number", example: 12500 },
                paidAppointmentsCount: { type: "number", example: 125 },
                totalAppointmentsCount: { type: "number", example: 200 },
                totalPatientsCount: { type: "number", example: 450 },
              },
            },
          },
        },

        AllUsersResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            results: { type: "number" },
            data: {
              type: "object",
              properties: {
                users: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },

        // ========== رفع الصور ==========
        UploadResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                imageUrl: {
                  type: "string",
                  example: "https://res.cloudinary.com/...",
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description:
          "🔐 تسجيل الدخول والتسجيل وإدارة الحساب - المعلومات تُستخرج من التوكن",
      },
      {
        name: "Patient",
        description: "👨‍🦰 عمليات المريض — حجز المواعيد والأطباء",
      },
      {
        name: "Doctor",
        description: "👨‍⚕️ عمليات الطبيب — إدارة البروفايل (يستخدم التوكن)",
      },
      { name: "Payment", description: "💳 الدفع عبر Stripe" },
      { name: "Prescription", description: "📋 الروشتات الطبية" },
      { name: "Messages", description: "💬 إدارة الرسائل (REST APIs)" },
      {
        name: "Notifications",
        description: "🔔 الإشعارات (تستلم عبر Socket.IO)",
      },
      { name: "Admin", description: "👑 إدارة المستخدمين والإحصائيات" },
      { name: "Upload", description: "📤 رفع الملفات والصور" },
    ],
  },
  apis: ["./src/modules/routes/*.js", "./src/v1_routes.js"],
};

export const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  // ========== 1. Swagger UI ==========
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customSiteTitle: "🏥 عيادة الشفاء — API Docs",
      customCss: `
        .swagger-ui .topbar { background: linear-gradient(135deg, #667eea, #764ba2); }
        .swagger-ui .topbar-wrapper .link { display: none; }
        .swagger-ui .info .title { color: #667eea; }
        .swagger-ui .scheme-container { background: #f8f9ff; }
        .swagger-ui .btn.authorize { border-color: #667eea; color: #667eea; }
        .swagger-ui .btn.authorize svg { fill: #667eea; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    }),
  );

  // ========== 2. صفحة اختبار الشات ==========
  app.get("/socket-test", (req, res) => {
    res.send(`<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>🧪 اختبار الشات - عيادة الشفاء</title>
  <script src="https://cdn.socket.io/4.8.3/socket.io.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; color: white; text-align: center; }
    .content { padding: 20px; }
    .connection-panel { background: #f0f4ff; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
    .connection-panel input, .connection-panel button { margin: 5px 0; padding: 10px; border-radius: 8px; border: 1px solid #ddd; width: 100%; }
    .connection-panel button { background: #667eea; color: white; cursor: pointer; border: none; font-weight: bold; }
    .status { padding: 10px; border-radius: 8px; text-align: center; font-weight: bold; margin-bottom: 15px; }
    .status.connected { background: #4caf50; color: white; }
    .status.disconnected { background: #f44336; color: white; }
    .timer { background: #ff9800; color: white; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 15px; display: none; }
    .messages { border: 1px solid #eee; border-radius: 12px; padding: 16px; height: 400px; overflow-y: auto; background: #fafafa; margin-bottom: 15px; }
    .message { margin-bottom: 12px; padding: 8px 12px; border-radius: 8px; background: white; }
    .message.system { background: #fff3e0; text-align: center; }
    .message .sender { font-weight: bold; color: #667eea; }
    .input-area { display: flex; gap: 10px; }
    .input-area textarea { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #ddd; resize: none; }
    .input-area button { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>💬 اختبار الشات المباشر</h1><p>عيادة الشفاء الرقمية</p></div>
    <div class="content">
      <div class="connection-panel">
        <input type="text" id="token" placeholder="JWT Token" style="direction:ltr">
        <input type="text" id="appointmentId" placeholder="Appointment ID" style="direction:ltr">
        <button onclick="connect()">🔌 اتصال</button>
        <button onclick="disconnect()" style="background:#f44336;">❌ قطع الاتصال</button>
      </div>
      <div id="status" class="status disconnected">⚪ غير متصل</div>
      <div id="timer" class="timer">⏰ --</div>
      <div class="messages" id="messages"></div>
      <div class="input-area">
        <textarea id="messageInput" rows="2" placeholder="اكتب رسالتك..."></textarea>
        <button onclick="sendMessage()">📤 إرسال</button>
      </div>
    </div>
  </div>
  <script>
    let socket = null, currentAppointmentId = null;
    function addMessage(sender, message, isSystem) {
      const div = document.getElementById('messages');
      const msg = document.createElement('div');
      msg.className = 'message' + (isSystem ? ' system' : '');
      msg.innerHTML = isSystem ? \`📢 \${sender}: \${message}\` : \`<span class="sender">\${sender}</span><br>\${message}\`;
      div.appendChild(msg);
      div.scrollTop = div.scrollHeight;
    }
    function updateTimer(msg) { const t = document.getElementById('timer'); t.style.display = 'block'; t.innerHTML = msg; }
    function updateStatus(connected) {
      const s = document.getElementById('status');
      s.className = connected ? 'status connected' : 'status disconnected';
      s.innerHTML = connected ? '🟢 متصل' : '🔴 غير متصل';
      if(!connected) document.getElementById('timer').style.display = 'none';
    }
    function connect() {
      const token = document.getElementById('token').value;
      const appId = document.getElementById('appointmentId').value;
      if(!token || !appId) { alert('ادخل التوكن و appointmentId'); return; }
      currentAppointmentId = appId;
      socket = io('https://micro-clinc.onrender.com', { auth: { token }, transports: ['websocket'] });
      socket.on('connect', () => { updateStatus(true); addMessage('نظام', '✅ تم الاتصال', true); socket.emit('join_appointment_room', { appointmentId: appId }); });
      socket.on('disconnect', () => { updateStatus(false); addMessage('نظام', '❌ تم قطع الاتصال', true); });
      socket.on('previous_messages', (data) => { addMessage('نظام', \`📜 \${data.messages.length} رسالة سابقة\`, true); });
      socket.on('receive_message', (data) => { addMessage(data.senderName, data.message || '🖼️ صورة'); });
      socket.on('user_joined', (data) => { addMessage('نظام', \`👋 \${data.name} دخل\`, true); });
      socket.on('chat_timer_update', (data) => { updateTimer(data.message); });
      socket.on('chat_ended', (data) => { addMessage('نظام', data.message, true); });
      socket.on('error', (data) => { addMessage('خطأ', data.message, true); });
    }
    function disconnect() { if(socket) { socket.disconnect(); socket = null; } updateStatus(false); }
    function sendMessage() {
      const input = document.getElementById('messageInput');
      const msg = input.value.trim();
      if(!msg || !socket) return;
      socket.emit('send_message', { appointmentId: currentAppointmentId, message: msg, imageUrl: null });
      addMessage('أنت', msg);
      input.value = '';
    }
  </script>
</body>
</html>`);
  });

  // ========== 3. صفحة اختبار الإشعارات ==========
  app.get("/notification-test", (req, res) => {
    res.send(`<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>🔔 اختبار الإشعارات - عيادة الشفاء</title>
  <script src="https://cdn.socket.io/4.8.3/socket.io.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #11998e, #38ef7d); padding: 20px; color: white; text-align: center; }
    .content { padding: 20px; }
    .connection-panel { background: #e8f5e9; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
    .connection-panel input, .connection-panel button { margin: 5px 0; padding: 10px; border-radius: 8px; border: 1px solid #ddd; width: 100%; }
    .connection-panel button { background: #11998e; color: white; cursor: pointer; border: none; font-weight: bold; }
    .status { padding: 10px; border-radius: 8px; text-align: center; font-weight: bold; margin-bottom: 15px; }
    .status.connected { background: #4caf50; color: white; }
    .status.disconnected { background: #f44336; color: white; }
    .counter { font-size: 20px; font-weight: bold; color: #11998e; text-align: center; margin-bottom: 10px; }
    .notifications-list { border: 1px solid #eee; border-radius: 12px; padding: 16px; height: 400px; overflow-y: auto; background: #fafafa; }
    .notification { margin-bottom: 12px; padding: 12px; border-radius: 12px; background: white; border-right: 4px solid #11998e; }
    .notification.unread { background: #e8f5e9; border-right-color: #ff9800; }
    .notification .title { font-weight: bold; margin-bottom: 5px; }
    .notification .body { color: #666; font-size: 14px; }
    .notification .meta { font-size: 11px; color: #999; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔔 مركز الإشعارات</h1><p>عيادة الشفاء الرقمية</p></div>
    <div class="content">
      <div class="connection-panel">
        <input type="text" id="token" placeholder="JWT Token" style="direction:ltr">
        <button onclick="connect()">🔌 اتصال</button>
        <button onclick="disconnect()" style="background:#f44336;">❌ قطع الاتصال</button>
      </div>
      <div id="status" class="status disconnected">⚪ غير متصل</div>
      <div class="counter">📬 الإشعارات: <span id="counter">0</span></div>
      <div class="notifications-list" id="notifications"></div>
      <div style="margin-top:15px; padding:12px; background:#f0f4ff; border-radius:12px; font-size:12px;">
        💡 الإشعارات تصل فوراً عند حجز موعد أو دفع أو تذكير
      </div>
    </div>
  </div>
  <script>
    let socket = null, notifications = [];
    function addNotification(n) {
      notifications.unshift(n);
      document.getElementById('counter').innerText = notifications.length;
      const container = document.getElementById('notifications');
      const div = document.createElement('div');
      div.className = 'notification' + (n.isRead ? '' : ' unread');
      div.innerHTML = \`<div class="title">\${n.title}</div><div class="body">\${n.body}</div><div class="meta">🕐 \${new Date(n.createdAt).toLocaleTimeString()}</div>\`;
      container.insertBefore(div, container.firstChild);
    }
    function updateStatus(connected) {
      const s = document.getElementById('status');
      s.className = connected ? 'status connected' : 'status disconnected';
      s.innerHTML = connected ? '🟢 متصل - جاهز للإشعارات' : '🔴 غير متصل';
    }
    function connect() {
      const token = document.getElementById('token').value;
      if(!token) { alert('ادخل التوكن'); return; }
      socket = io('https://micro-clinc.onrender.com', { auth: { token }, transports: ['websocket'] });
      socket.on('connect', () => { updateStatus(true); addNotification({ title: '✅ تم الاتصال', body: 'جاهز لاستقبال الإشعارات', isRead: false, createdAt: new Date() }); });
      socket.on('disconnect', () => { updateStatus(false); });
      socket.on('new_notification', (data) => { addNotification(data); });
      socket.on('connect_error', () => { alert('خطأ في الاتصال'); });
    }
    function disconnect() { if(socket) { socket.disconnect(); socket = null; } updateStatus(false); }
  </script>
</body>
</html>`);
  });

  // ========== 4. الصفحة الرئيسية ==========
  app.get("/test", (req, res) => {
    res.send(`<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>🧪 أدوات الاختبار - عيادة الشفاء</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: white; text-align: center; margin-bottom: 30px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; text-align: center; text-decoration: none; color: inherit; display: block; transition: transform 0.3s; }
    .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .card-icon { font-size: 48px; margin-bottom: 16px; }
    .card-title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
    .card-desc { font-size: 14px; color: #666; }
    .footer { text-align: center; margin-top: 40px; color: rgba(255,255,255,0.7); font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 عيادة الشفاء - أدوات الاختبار</h1>
    <div class="cards">
      <a href="/api-docs" class="card"><div class="card-icon">📚</div><div class="card-title">Swagger API Docs</div><div class="card-desc">توثيق كامل لـ REST APIs</div></a>
      <a href="/socket-test" class="card"><div class="card-icon">💬</div><div class="card-title">اختبار الشات</div><div class="card-desc">جرب نظام المحادثة Socket.IO</div></a>
      <a href="/notification-test" class="card"><div class="card-icon">🔔</div><div class="card-title">اختبار الإشعارات</div><div class="card-desc">استقبل الإشعارات الفورية</div></a>
    </div>
    <div class="footer">🔐 جميع الأدوات تتطلب JWT Token من /auth/login</div>
  </div>
</body>
</html>`);
  });

  console.log("📚 Swagger docs: https://micro-clinc.onrender.com/api-docs");
  console.log("🧪 Socket tester: https://micro-clinc.onrender.com/socket-test");
  console.log("🔔 Notification tester: https://micro-clinc.onrender.com/notification-test");
  console.log("🧪 Test dashboard: https://micro-clinc.onrender.com/test");
};