import { Resend } from "resend";
import { prescriptionTemplate } from "./prescriptiontemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPrescriptionEmail = async ({ patientEmail, patientName, doctorName, diagnosis, medications, appointmentDate }) => {

  const html = prescriptionTemplate({ patientName, doctorName, diagnosis, medications, appointmentDate });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: patientEmail,
    subject: `روشتتك الطبية من د. ${doctorName} 💊`,
    html,
  });

  console.log(`✅ تم إرسال الروشتة إلى: ${patientEmail}`);
};