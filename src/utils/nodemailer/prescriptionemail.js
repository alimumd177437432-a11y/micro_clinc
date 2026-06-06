import nodemailer from "nodemailer";
import { prescriptionTemplate } from "./prescriptiontemplate";

export const sendPrescriptionEmail = async ({ patientEmail, patientName, doctorName, diagnosis, medications, appointmentDate }) => {
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, // ✅ إجبار IPv4 عشان يشتغل على Render
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const html = prescriptionTemplate({ patientName, doctorName, diagnosis, medications, appointmentDate });

  await transporter.sendMail({
    from: `"عيادة الشفاء الرقمية 🏥" <${process.env.NODEMAILER_USER}>`,
    to: patientEmail,
    subject: `روشتتك الطبية من د. ${doctorName} 💊`,
    html,
  });

  console.log(`✅ تم إرسال الروشتة إلى: ${patientEmail}`);
};