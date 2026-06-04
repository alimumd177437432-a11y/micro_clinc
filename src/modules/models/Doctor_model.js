import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const doctorDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      default: null,
    },
    consultationFee: {
      type: Number,
      default: 0,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    workingDays: {
      type: [String],
      default: [],
    },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
    slots: [
      {
        time: { type: String, required: true },
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export const doctorDetailsModel = model("DoctorDetail", doctorDetailsSchema);
