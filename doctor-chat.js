// doctor-chat.js
import { io } from "socket.io-client";
import readline from "readline";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

let socket = null;
let DOCTOR_TOKEN = "";
let APPOINTMENT_ID = "";

const connectToChat = () => {
  console.log(`\n${colors.cyan}🏥 جاري الاتصال بالعيادة الرقمية...${colors.reset}`);

  socket = io("https://micro-clinc.onrender.com", {
    auth: { token: DOCTOR_TOKEN },
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    console.log(`${colors.green}✅ تم الاتصال بالسيرفر${colors.reset}`);
    socket.emit("join_appointment_room", { appointmentId: APPOINTMENT_ID });
  });

  socket.on("chat_timer", (data) => {
    console.log(`\n${colors.yellow}${data.message}${colors.reset}`);
  });

  socket.on("chat_timer_update", (data) => {
    process.stdout.write(`\r${colors.yellow}${data.message}${colors.reset}`);
  });

  socket.on("chat_ended", (data) => {
    console.log(`\n${colors.red}${data.message}${colors.reset}`);
    console.log(`${colors.yellow}سيتم إغلاق الشات بعد 3 ثواني...${colors.reset}`);
    setTimeout(() => {
      if (socket) socket.disconnect();
      rl.close();
      process.exit(0);
    }, 3000);
  });

  socket.on("previous_messages", ({ messages }) => {
    console.log(`\n${colors.magenta}📜 سجل المحادثة (${messages.length} رسالة):${colors.reset}`);
    if (messages.length === 0) {
      console.log(`   لا توجد رسائل سابقة`);
    } else {
      messages.forEach(msg => {
        const sender = msg.senderId?.name || "مستخدم";
        if (msg.message) console.log(`   ${sender}: ${msg.message}`);
        if (msg.image) console.log(`   ${sender}: 🖼️ [صورة]`);
      });
    }
    console.log(`\n${colors.green}✨ جاهز لبدء الكشف${colors.reset}`);
    console.log(`${colors.cyan}📝 الأوامر: اكتب نص | /image [رابط] | /exit${colors.reset}\n`);
  });

  socket.on("receive_message", (data) => {
    console.log(`\n${colors.magenta}📩 ${data.senderName} (${data.senderRole}):${colors.reset}`);
    if (data.message) console.log(`   💬 ${data.message}`);
    if (data.image) console.log(`   🖼️ صورة: ${data.image}`);
    console.log(`\n${colors.cyan}✏️ اكتب ردك:${colors.reset}`);
  });

  socket.on("user_joined", ({ name, role }) => {
    const icon = role === "patient" ? "👨‍🦰" : "👨‍⚕️";
    console.log(`${colors.green}👋 ${icon} ${name} (${role}) دخل المحادثة${colors.reset}`);
    if (role === "patient") {
      console.log(`${colors.yellow}🏥 المريض جاهز - يمكنك بدء الكشف${colors.reset}`);
    }
  });

  socket.on("user_left", ({ name }) => {
    console.log(`${colors.red}👋 ${name} غادر المحادثة${colors.reset}`);
  });

  socket.on("error", ({ message }) => {
    console.log(`\n${colors.red}❌ خطأ: ${message}${colors.reset}`);
    if (message.includes("انتهت") || message.includes("30 دقيقة")) {
      setTimeout(() => {
        if (socket) socket.disconnect();
        rl.close();
        process.exit(0);
      }, 2000);
    }
  });

  socket.on("disconnect", () => {
    console.log(`\n${colors.red}❌ انقطع الاتصال بالخادم${colors.reset}`);
  });

  rl.on("line", (input) => {
    const command = input.trim();
    if (command === "/exit") {
      if (socket) socket.disconnect();
      rl.close();
      process.exit(0);
    } else if (command.startsWith("/image ")) {
      const imageUrl = command.substring(7);
      if (imageUrl) {
        socket.emit("send_message", { appointmentId: APPOINTMENT_ID, message: null, imageUrl });
        console.log(`${colors.green}✓ تم إرسال الصورة${colors.reset}`);
      }
    } else if (command) {
      socket.emit("send_message", { appointmentId: APPOINTMENT_ID, message: command, imageUrl: null });
    }
  });
};

// ── بدء التشغيل
console.log(`${colors.cyan}`);
console.log("╔═══════════════════════════════════════════╗");
console.log("║     👨‍⚕️ شات الدكتور - عيادة الشفاء 👨‍⚕️    ║");
console.log("╚═══════════════════════════════════════════╝");
console.log(`${colors.reset}`);

// يسأل عن البيانات أول
DOCTOR_TOKEN = await ask(`${colors.cyan}🔑 أدخل التوكن: ${colors.reset}`);
APPOINTMENT_ID = await ask(`${colors.cyan}📋 أدخل appointmentId: ${colors.reset}`);

connectToChat();