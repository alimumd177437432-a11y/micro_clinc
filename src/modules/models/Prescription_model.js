import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const prescriptionSchema =  new mongoose.Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, 
    },
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
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    medications: [
      {
        name: { type: String, required: true },    
        dosage: { type: String, required: true }, 
        frequency: { type: String, required: true } 
      }
    ],
  },
  { timestamps: true }
);

export const prescriptionModel = mongoose.model("Prescription", prescriptionSchema);