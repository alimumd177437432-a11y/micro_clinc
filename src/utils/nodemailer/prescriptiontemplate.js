export const prescriptionTemplate = ({ patientName, doctorName, diagnosis, medications, appointmentDate }) => {
  const medicationsRows = medications.map((med, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8f9ff' : 'white'}">
      <td style="padding:12px 16px; border-bottom:1px solid #eee;">${med.name}</td>
      <td style="padding:12px 16px; border-bottom:1px solid #eee; text-align:center;">${med.dosage}</td>
      <td style="padding:12px 16px; border-bottom:1px solid #eee; text-align:center;">${med.frequency}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Tahoma,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🏥</div>
      <h1 style="color:white;margin:0;font-size:24px;">عيادة الشفاء الرقمية</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">روشتة طبية رسمية</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:17px;color:#333;">مرحباً <strong>${patientName}</strong> 👋</p>
      <p style="color:#555;line-height:1.7;">
        نتمنى لك الشفاء العاجل. فيما يلي ملخص زيارتك الطبية مع 
        <strong>د. ${doctorName}</strong> بتاريخ 
        <strong>${new Date(appointmentDate).toLocaleDateString("ar-EG")}</strong>.
      </p>

      <div style="background:#f0f4ff;border-right:4px solid #667eea;border-radius:8px;padding:16px 20px;margin:24px 0;">
        <p style="margin:0;font-size:13px;color:#667eea;font-weight:600;">التشخيص</p>
        <p style="margin:8px 0 0;font-size:16px;color:#333;font-weight:500;">${diagnosis}</p>
      </div>

      <h3 style="color:#333;margin-bottom:12px;">💊 الأدوية الموصوفة</h3>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #eee;">
        <thead>
          <tr style="background:#667eea;">
            <th style="padding:12px 16px;color:white;text-align:right;font-weight:500;">الدواء</th>
            <th style="padding:12px 16px;color:white;text-align:center;font-weight:500;">الجرعة</th>
            <th style="padding:12px 16px;color:white;text-align:center;font-weight:500;">التكرار</th>
          </tr>
        </thead>
        <tbody>${medicationsRows}</tbody>
      </table>

      <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin-top:24px;text-align:center;">
        <p style="margin:0;color:#2e7d32;font-size:14px;">✅ تم حفظ هذه الروشتة في ملفك الطبي الإلكتروني</p>
      </div>
    </div>

    <div style="background:#f8f9ff;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;color:#aaa;font-size:12px;">عيادة الشفاء الرقمية — هذا الإيميل أُرسل تلقائياً، يرجى عدم الرد عليه.</p>
    </div>
  </div>
</body>
</html>`;
};