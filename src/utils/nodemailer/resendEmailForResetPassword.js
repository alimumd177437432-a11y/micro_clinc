import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { generateOtp } from "../otp/otp.js";
import { resetPasswprdTemplete } from "./resetPasswordTemplete.js";

export const resetPasswordEmail = async (userEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const otpCode = generateOtp();

    const otpToken = jwt.sign(
      { email: userEmail, otp: otpCode },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const htmlBody = resetPasswprdTemplete(otpCode);

    const mailOptions = {
      from: `"عيادة الشفاء الرقمية" <${process.env.NODEMAILER_USER}>`,
      to: userEmail,
      subject: "إعادة تعيين كلمة المرور - عيادة الشفاء",
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent successfully to: ${userEmail} 🎉`);
    
    return { otpCode, otpToken };
    
  } catch (error) {
    console.error("Nodemailer Error Inside: ", error.message);
    throw new Error("فشل في إرسال إيميل إعادة تعيين كلمة المرور");
  }
};