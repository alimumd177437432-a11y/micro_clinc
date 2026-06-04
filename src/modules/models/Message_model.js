import mongoose, { Schema, model, mongo } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    image: {
      type: String, 
      default: null,
    },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("Message", messageSchema);