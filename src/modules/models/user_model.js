import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required:true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    birthDate: {
      type: Date,
      // required: true,
    },
    verifed: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    otp: {
      type: String,
    },
  },
  { timestamps: true }
);


export const userModel = mongoose.model("User", userSchema);