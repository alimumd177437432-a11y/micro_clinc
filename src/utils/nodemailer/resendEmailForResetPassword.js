import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { generateOtp } from "../otp/otp.js";
import { resetPasswprdTemplete } from "./resetPasswordTemplete.js";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const resetPasswordEmail = async (userEmail) => {
  try {
    const otpCode = generateOtp();

    const otpToken = jwt.sign(
      { email: userEmail, otp: otpCode },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const htmlBody = resetPasswprdTemplete(otpCode);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: userEmail,
      subject: "إعادة تعيين كلمة المرور - عيادة الشفاء",
      html: htmlBody,
    });

    console.log(`Reset email sent successfully to: ${userEmail} 🎉`);

    return { otpCode, otpToken };

  } catch (error) {
    console.error("Resend Error: ", error.message);
    throw new Error("فشل في إرسال إيميل إعادة تعيين كلمة المرور");
  }
};