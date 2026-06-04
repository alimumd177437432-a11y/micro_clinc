// patient-chat.js
import { io } from "socket.io-client";
import readline from "readline";

// 🔐 ضع توكن المريض هنا (سجل دخول أولاً)
const PATIENT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjE0NTM0YzQ4MmRlYzQ0NmFkYzBkNyIsIm5hbWUiOiJlc3NhIiwiZW1haWwiOiJhbGltdW1kMTc3NDM3NEBnbWFpbC5jb20iLCJyb2xlIjoicGF0aWVudCIsInBob25lIjoiMDUzMjY1NTIzNTciLCJpYXQiOjE3ODA1NjgxNTksImV4cCI6MTc4MDY1NDU1OX0.uA2cw6c0NFxgz0CQXaAzPd5qp1n0vnQsMMy6cXZZLTI";

// 🔐 ضع ID الموعد هنا (من بعد الحجز)
const APPOINTMENT_ID = "6a21467ac482dec446adc10f";

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

let socket = null;
let timerInterval = null;

const connectToChat = () => {
  console.log(`\n${colors.cyan}🏥 جاري الاتصال بالعيادة الرقمية...${colors.reset}`);
  
  socket = io("https://micro-clinc.onrender.com", {
    auth: { token: PATIENT_TOKEN },
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
    // مسح السطر الحالي وكتابة المؤقت الجديد
    process.stdout.write(`\r${colors.yellow}${data.message}${colors.reset}`);
  });

  socket.on("chat_ended", (data) => {
    console.log(`\n${colors.red}${data.message}${colors.reset}`);
    console.log(`${colors.yellow}سيتم إغلاق الشات بعد 3 ثواني...${colors.reset}`);
    
    if (timerInterval) clearInterval(timerInterval);
    
    setTimeout(() => {
      if (socket) socket.disconnect();
      rl.close();
      process.exit(0);
    }, 3000);
  });

  socket.on("previous_messages", ({ messages }) => {
    console.log(`\n${colors.magenta}📜 الرسائل السابقة (${messages.length} رسالة):${colors.reset}`);
    if (messages.length === 0) {
      console.log(`   لا توجد رسائل سابقة`);
    } else {
      messages.forEach(msg => {
        const sender = msg.senderId?.name || "مستخدم";
        if (msg.message) console.log(`   ${sender}: ${msg.message}`);
        if (msg.image) console.log(`   ${sender}: 🖼️ [صورة]`);
      });
    }
    console.log(`\n${colors.green}✨ أنت الآن في المحادثة${colors.reset}`);
    console.log(`${colors.cyan}📝 الأوامر: اكتب نص /image [رابط] /exit${colors.reset}`);
  });

  socket.on("receive_message", (data) => {
    console.log(`\n${colors.blue}📩 ${data.senderName} (${data.senderRole}):${colors.reset}`);
    if (data.message) console.log(`   💬 ${data.message}`);
    if (data.image) console.log(`   🖼️ صورة: ${data.image}`);
    console.log(`\n${colors.cyan}✏️ اكتب ردك:${colors.reset}`);
  });

  socket.on("user_joined", ({ name, role }) => {
    console.log(`${colors.green}👋 ${name} (${role}) دخل المحادثة${colors.reset}`);
  });

  socket.on("user_left", ({ name }) => {
    console.log(`${colors.red}👋 ${name} غادر المحادثة${colors.reset}`);
  });

  socket.on("user_typing", ({ name, isTyping }) => {
    if (isTyping) {
      console.log(`${colors.yellow}✍️ ${name} يكتب الآن...${colors.reset}`);
    }
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
};

const sendMessage = (message) => {
  if (!socket) {
    console.log(`${colors.red}❌ ليس لديك اتصال نشط${colors.reset}`);
    return;
  }
  
  socket.emit("send_message", {
    appointmentId: APPOINTMENT_ID,
    message: message,
    imageUrl: null
  });
};

const sendImage = (imageUrl) => {
  if (!socket) {
    console.log(`${colors.red}❌ ليس لديك اتصال نشط${colors.reset}`);
    return;
  }
  
  socket.emit("send_message", {
    appointmentId: APPOINTMENT_ID,
    message: null,
    imageUrl: imageUrl
  });
  console.log(`${colors.green}✓ تم إرسال الصورة${colors.reset}`);
};

// معالجة الأوامر من المستخدم
rl.on("line", (input) => {
  const command = input.trim();
  
  if (command === "/exit") {
    console.log(`${colors.red}❌ إنهاء الشات...${colors.reset}`);
    if (socket) socket.disconnect();
    rl.close();
    process.exit(0);
  } 
  else if (command.startsWith("/image ")) {
    const imageUrl = command.substring(7);
    if (imageUrl) {
      sendImage(imageUrl);
    } else {
      console.log(`${colors.red}❌ الرابط مطلوب. استخدم: /image https://...${colors.reset}`);
    }
  }
  else if (command) {
    sendMessage(command);
  }
});

// بدء التشغيل
console.log(`${colors.bright}${colors.cyan}`);
console.log("╔═══════════════════════════════════════════╗");
console.log("║     👨‍🦰 شات المريض - عيادة الشفاء 👨‍🦰      ║");
console.log("╚═══════════════════════════════════════════╝");
console.log(`${colors.reset}`);

connectToChat();