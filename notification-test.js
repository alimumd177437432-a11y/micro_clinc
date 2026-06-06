// notification-test.js
import { io } from "socket.io-client";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

console.log(`${colors.cyan}`);
console.log("╔═══════════════════════════════════════════╗");
console.log("║     🔔 تجربة الإشعارات - عيادة الشفاء    ║");
console.log("╚═══════════════════════════════════════════╝");
console.log(`${colors.reset}`);

// خذ التوكن من الـ argument مباشرة
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log(`${colors.red}❌ استخدم: node notification-test.js YOUR_TOKEN${colors.reset}`);
  process.exit(1);
}

const socket = io("https://micro-clinc.onrender.com", {
  auth: { token: TOKEN },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log(`${colors.green}✅ متصل — جاري الاستماع للإشعارات...${colors.reset}`);
  console.log(`${colors.yellow}💡 الآن اعمل حجز أو دفع من terminal ثاني وشوف الإشعار يوصل هون${colors.reset}\n`);
});

socket.on("new_notification", (data) => {
  console.log(`\n${colors.magenta}🔔 إشعار جديد!${colors.reset}`);
  console.log(`   العنوان: ${data.title}`);
  console.log(`   النص: ${data.body}`);
  console.log(`   النوع: ${data.type}`);
  console.log(`   الوقت: ${new Date(data.createdAt).toLocaleTimeString("ar")}\n`);
});

socket.on("connect_error", (err) => {
  console.log(`${colors.red}❌ خطأ: ${err.message}${colors.reset}`);
});