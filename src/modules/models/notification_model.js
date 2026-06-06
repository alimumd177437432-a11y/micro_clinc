import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: ["booking", "payment", "reminder", "session_start", "prescription"],
    required: true,
  },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const notificationModel = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);