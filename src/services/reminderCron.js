import cron from "node-cron";
import { appointmentModel } from "../modules/models/Appointment_model.js";
import { sendNotification } from "./notificationService.js";

export const startReminderCron = () => {
  // كل دقيقة يشوف مين موعده بعد 5 دقائق
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
      const in6Min = new Date(now.getTime() + 6 * 60 * 1000);

      // جيب المواعيد اللي وقتها بين 5 و 6 دقائق من هلأ
      const appointments = await appointmentModel
        .find({ status: "confirmed", paymentStatus: "paid" })
        .populate("patientId", "name")
        .populate("doctorId", "name");

      for (const appointment of appointments) {
        const dateOnly = new Date(appointment.date).toISOString().split("T")[0];
        const appointmentTime = new Date(`${dateOnly}T${appointment.timeSlot}:00.000+03:00`);

        // لو الموعد بين 5 و 6 دقائق من هلأ
        if (appointmentTime >= in5Min && appointmentTime < in6Min) {
          // إشعار للمريض
          await sendNotification({
            userId: appointment.patientId._id,
            title: "⏰ موعدك بعد 5 دقائق!",
            body: `موعدك مع د. ${appointment.doctorId.name} بعد 5 دقائق. كن جاهزاً!`,
            type: "reminder",
            appointmentId: appointment._id,
          });

          // إشعار للدكتور
          await sendNotification({
            userId: appointment.doctorId._id,
            title: "⏰ لديك موعد بعد 5 دقائق!",
            body: `موعدك مع المريض ${appointment.patientId.name} بعد 5 دقائق.`,
            type: "reminder",
            appointmentId: appointment._id,
          });
        }
      }
    } catch (err) {
      console.error("Cron error:", err.message);
    }
  });

  console.log("✅ Reminder cron job started");
};