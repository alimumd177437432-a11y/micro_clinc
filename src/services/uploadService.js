import multer from "multer";
import { uploadToCloudinary } from "./cloudinaryService.js";
import { ErrorHandler, SendError } from "./errorhanderler.js";

// إعداد التخزين المؤقت في الذاكرة (لن نخزن على القرص)
const storage = multer.memoryStorage();

// فلترة الملفات (صور فقط)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new SendError(400, "يرجى رفع صورة فقط"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Middleware لرفع الصورة إلى Cloudinary
export const uploadImageToCloudinary = ErrorHandler(async (req, res, next) => {
  if (!req.file) {
    throw new SendError(400, "لم يتم رفع أي صورة");
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    req.file.originalname,
    "clinic-messages"
  );

  req.imageUrl = result.secure_url;
  next();
});