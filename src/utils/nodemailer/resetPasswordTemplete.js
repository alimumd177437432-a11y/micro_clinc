export const resetPasswprdTemplete = (code) => {
  return `
  <!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <title>إعادة تعيين كلمة المرور</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4; direction: rtl; text-align: center;">
    <div style="background:#ffffff; max-width:500px; margin:40px auto; padding:30px; border-radius:10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h2 style="color:#4CAF50;">عيادة الشفاء الرقمية</h2>
      <p style="color:#333; font-size:16px;">لقد طلبت إعادة تعيين كلمة المرور. رمز التحقق (OTP) الخاص بك هو:</p>
      <div style="background:#4CAF50; color:white; padding:15px; font-size:24px; font-weight:bold; display:inline-block; letter-spacing: 2px; border-radius:5px; margin:20px 0;">
        ${code}
      </div>
      <p style="color:#777; font-size:12px;">هذا الرمز صالح لمدة 15 دقيقة فقط. إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا الإيميل بأمان.</p>
      <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
      <p style="color:#999; font-size:12px;">© 2026 عيادة الشفاء. جميع الحقوق محفوظة.</p>
    </div>
  </body>
  </html>`;
};