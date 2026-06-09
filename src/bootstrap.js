import cors from "cors";
import { setupSwagger } from "./swagger.js";
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { v1Router } from "./v1_routes.js";
import { DBconection } from "./DBconection.js";
import { setupSocketHandlers } from "./socketServer.js";
import dotenv from "dotenv";
import { globalLimiter } from "./middelwares.js/rateLimiter.js";

dotenv.config();

const port = process.env.PORT || 2000;

export const bootstrap = async (app) => {
  // إنشاء HTTP Server
  const server = http.createServer(app);
  
  // إعداد Socket.IO
  const io = new SocketServer(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io"
  });
  
  // إدارة اتصالات Socket
  setupSocketHandlers(io);
  
  // Middlewares
  app.use(cors());
  app.use("/micro", globalLimiter);
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));
  
  // Routes
  app.use("/micro/v1", v1Router);
  setupSwagger(app);
  
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