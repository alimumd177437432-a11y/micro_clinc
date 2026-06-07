import rateLimit from "express-rate-limit";
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: { status: "error", message: "طلبات كثيرة جداً، انتظر 15 دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: "error", message: "محاولات كثيرة، انتظر 15 دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});