import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { v1Router } from "./v1_routes.js";
import { DBconection } from "./DBconection.js";
import { setupSocketHandlers } from "./socketServer.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 2000;

export const bootstrap = async (app) => {
  // إنشاء HTTP Server
  const server = http.createServer(app);
  
  // إعداد Socket.IO
  const io = new SocketServer(server, {
    cors: {
      origin: "*", // للسماح بالاتصال من أي فرونت (عدل حسب الحاجة)
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io" // المسار الافتراضي
  });
  
  // إدارة اتصالات Socket
  setupSocketHandlers(io);
  
  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));
  
  // Routes
  app.use("/micro/v1", v1Router);
  
  // Error handling middleware
  app.use((error, req, res, next) => {
    const message = error.message;
    const status = error.status || 500;
    res.status(status).json({ message });
  });
  
  // الاتصال بقاعدة البيانات
  await DBconection();
  
  // تشغيل السيرفر
  server.listen(port, () => {
    console.log(`✅ Server running on port ${port}...`);
    console.log(`✅ Socket.IO running on path: /socket.io`);
  });
};