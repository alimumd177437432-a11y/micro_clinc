import mongoose from "mongoose";
import { Schema, model } from "mongoose";
const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    stripeSessionId: {
      type: String,
    },
    chatStartTime: { type: Date, default: null },
    chatEndTime: { type: Date, default: null },
    isChatActive: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const appointmentModel = mongoose.model(
  "Appointment",
  appointmentSchema,
);
