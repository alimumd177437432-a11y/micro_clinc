// src/socketServer.js
import jwt from "jsonwebtoken";
import { messageModel } from "./modules/models/Message_model.js";
import { appointmentModel } from "./modules/models/Appointment_model.js";
import { userModel } from "./modules/models/user_model.js";

import { setIO } from "./services/notificationService.js";

export const setupSocketHandlers = (io) => {
  setIO(io); // ✅ حفظ الـ io عشان نستخدمه في الإشعارات
  // مصادقة Socket باستخدام JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await userModel.findById(decoded.id);
      
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        email: user.email
      };
      
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role})`);
    
    // ✅ كل مستخدم يدخل غرفته الخاصة عشان يستقبل إشعاراته
    socket.join(`user_${socket.user.id}`);

    // 1. الانضمام إلى غرفة الموعد
    socket.on("join_appointment_room", async ({ appointmentId }) => {
      try {
        // التحقق من صحة الموعد والمستخدم
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
          socket.emit("error", { message: "الموعد غير موجود" });
          return;
        }

        const isPatient = socket.user.role === "patient" && appointment.patientId.toString() === socket.user.id;
        const isDoctor = socket.user.role === "doctor" && appointment.doctorId.toString() === socket.user.id;
        const isAdmin = socket.user.role === "admin";

        if (!isPatient && !isDoctor && !isAdmin) {
          socket.emit("error", { message: "ليس لديك صلاحية للدخول إلى هذه المحادثة" });
          return;
        }

        // التحقق من أن الموعد مؤكد أو مكتمل
        if (appointment.status !== "confirmed" && appointment.status !== "completed") {
          socket.emit("error", { message: "لا يمكن الدخول إلى المحادثة الآن" });
          return;
        }

        // ⏰ حساب وقت انتهاء المحادثة (date + timeSlot + 30 دقيقة)
        const [slotHours, slotMinutes] = appointment.timeSlot.split(":").map(Number);
        // نأخذ التاريخ بدون وقت ونضيف الـ timeSlot كـ UTC offset +3 (فلسطين/الأردن)
        const dateOnly = new Date(appointment.date).toISOString().split("T")[0];
        const appointmentStart = new Date(`${dateOnly}T${appointment.timeSlot}:00.000+03:00`);
        const chatEndTime = new Date(appointmentStart.getTime() + 30 * 60 * 1000);
        const now = new Date();

        // التحقق: إذا مر على الموعد أكثر من 30 دقيقة، امنع الدخول
        if (now > chatEndTime) {
          socket.emit("error", { message: "انتهت مدة المحادثة (30 دقيقة)" });
          return;
        }

        const roomName = `appointment_${appointmentId}`;
        
        // مغادرة الغرف السابقة
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room !== socket.id && room.startsWith("appointment_")) {
            socket.leave(room);
          }
        });

        // الانضمام إلى الغرفة الجديدة
        socket.join(roomName);
        socket.appointmentId = appointmentId;
        
        console.log(`📌 ${socket.user.name} joined room: ${roomName}`);

        // حساب الوقت المتبقي
        const timeLeft = chatEndTime - now;
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

        // إرسال المؤقت للمستخدم
        socket.emit("chat_timer", {
          timeLeft: timeLeft,
          endTime: chatEndTime,
          minutesLeft: minutesLeft,
          secondsLeft: secondsLeft,
          message: `⏰ المحادثة مدتها 30 دقيقة. متبقي: ${minutesLeft} دقيقة و ${secondsLeft} ثانية`
        });
        
        // إرسال آخر 50 رسالة للمستخدم
        const previousMessages = await messageModel.find({ appointmentId })
          .sort({ createdAt: 1 })
          .limit(50)
          .populate("senderId", "name role");
        
        socket.emit("previous_messages", { messages: previousMessages });
        
        // إشعار الغرفة بأن مستخدم جديد دخل
        socket.to(roomName).emit("user_joined", {
          userId: socket.user.id,
          name: socket.user.name,
          role: socket.user.role
        });

        // جدول تحديث المؤقت كل دقيقة
        const timerInterval = setInterval(() => {
          // التحقق إذا كان الـ socket لا يزال في الغرفة
          const room = Array.from(socket.rooms).find(r => r.startsWith("appointment_"));
          if (!room) {
            clearInterval(timerInterval);
            return;
          }
          
          const remaining = chatEndTime - new Date();
          
          if (remaining <= 0) {
            clearInterval(timerInterval);
            return;
          }
          
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          
          socket.emit("chat_timer_update", {
            timeLeft: remaining,
            minutesLeft: mins,
            secondsLeft: secs,
            message: `⏰ متبقي: ${mins} دقيقة و ${secs} ثانية`
          });
          
        }, 60000); // كل دقيقة
        
        // حفظ الـ interval في الـ socket عشان ننظفه بعدين
        socket.timerInterval = timerInterval;

        // جدول إغلاق الشات بعد 30 دقيقة
        if (timeLeft > 0) {
          setTimeout(async () => {
            // إشعار بانتهاء المحادثة
            io.to(roomName).emit("chat_ended", {
              message: "🔴 انتهت مدة المحادثة (30 دقيقة). سيتم إغلاق الشات الآن."
            });
            
            // تنظيف الـ interval
            if (socket.timerInterval) {
              clearInterval(socket.timerInterval);
            }
            
            // طرد المستخدمين من الغرفة بعد 3 ثواني
            setTimeout(() => {
              io.in(roomName).socketsLeave(roomName);
            }, 3000);
            
          }, timeLeft);
        }
        
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "حدث خطأ أثناء الانضمام إلى المحادثة" });
      }
    });

    // 2. إرسال رسالة
    socket.on("send_message", async ({ appointmentId, message, imageUrl }) => {
      try {
        if (!appointmentId || (!message && !imageUrl)) {
          socket.emit("error", { message: "يرجى إدخال نص أو رفع صورة" });
          return;
        }

        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
          socket.emit("error", { message: "الموعد غير موجود" });
          return;
        }

        const isPatient = socket.user.role === "patient" && appointment.patientId.toString() === socket.user.id;
        const isDoctor = socket.user.role === "doctor" && appointment.doctorId.toString() === socket.user.id;
        const isAdmin = socket.user.role === "admin";

        if (!isPatient && !isDoctor && !isAdmin) {
          socket.emit("error", { message: "ليس لديك صلاحية للإرسال" });
          return;
        }

        // حفظ الرسالة في قاعدة البيانات
        const newMessage = await messageModel.create({
          appointmentId,
          senderId: socket.user.id,
          message: message || null,
          image: imageUrl || null,
        });

        const populatedMessage = await messageModel.findById(newMessage._id)
          .populate("senderId", "name role");

        const roomName = `appointment_${appointmentId}`;
        
        // بث الرسالة لجميع أعضاء الغرفة
        io.to(roomName).emit("receive_message", {
          messageId: populatedMessage._id,
          senderId: populatedMessage.senderId._id,
          senderName: populatedMessage.senderId.name,
          senderRole: populatedMessage.senderId.role,
          message: populatedMessage.message,
          image: populatedMessage.image,
          createdAt: populatedMessage.createdAt
        });
        
        console.log(`💬 Message sent in ${roomName} by ${socket.user.name}`);
        
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "حدث خطأ أثناء إرسال الرسالة" });
      }
    });

    // 3. كتابة الآن... (Typing indicator)
    socket.on("typing_start", ({ appointmentId }) => {
      const roomName = `appointment_${appointmentId}`;
      socket.to(roomName).emit("user_typing", {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping: true
      });
    });

    socket.on("typing_stop", ({ appointmentId }) => {
      const roomName = `appointment_${appointmentId}`;
      socket.to(roomName).emit("user_typing", {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping: false
      });
    });

    // 4. مغادرة الغرفة
    socket.on("leave_appointment_room", () => {
      if (socket.appointmentId) {
        const roomName = `appointment_${socket.appointmentId}`;
        socket.leave(roomName);
        console.log(`👋 ${socket.user.name} left room: ${roomName}`);
        socket.appointmentId = null;
      }
      
      // تنظيف الـ interval
      if (socket.timerInterval) {
        clearInterval(socket.timerInterval);
        socket.timerInterval = null;
      }
    });

    // 5. الدكتور ينهي الجلسة (إغلاق الشات لكل من في الغرفة)
    socket.on("end_session", ({ appointmentId }) => {
      if (socket.user.role !== "doctor") {
        socket.emit("error", { message: "فقط الدكتور يمكنه إنهاء الجلسة" });
        return;
      }
      const roomName = `appointment_${appointmentId}`;
      io.to(roomName).emit("session_ended_by_doctor", {
        message: "🔴 الدكتور أنهى الجلسة. تم إغلاق المحادثة."
      });
      setTimeout(() => {
        io.in(roomName).socketsLeave(roomName);
      }, 2000);
      console.log(`🏁 الدكتور ${socket.user.name} أنهى الجلسة: ${roomName}`);
    });

    // 5. قطع الاتصال
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
      
      // تنظيف الـ interval
      if (socket.timerInterval) {
        clearInterval(socket.timerInterval);
        socket.timerInterval = null;
      }
      
      if (socket.appointmentId) {
        const roomName = `appointment_${socket.appointmentId}`;
        socket.to(roomName).emit("user_left", {
          userId: socket.user.id,
          name: socket.user.name
        });
      }
    });
  });
};