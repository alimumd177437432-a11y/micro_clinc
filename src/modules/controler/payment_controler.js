import Stripe from "stripe";
import { appointmentModel } from "../models/Appointment_model.js";
import { doctorDetailsModel } from "../models/Doctor_model.js";
import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { sendNotification } from "../../services/notificationService.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── 1. إنشاء Stripe Checkout Session
export const createCheckoutSession = ErrorHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const patientId = req.user.id;

  const appointment = await appointmentModel
    .findById(appointmentId)
    .populate("doctorId", "name email")
    .populate("patientId", "name email");

  if (!appointment) throw new SendError(404, "الحجز غير موجود");

  if (appointment.patientId._id.toString() !== patientId)
    throw new SendError(403, "ليس لديك صلاحية للوصول لهذا الحجز");

  if (appointment.paymentStatus === "paid")
    throw new SendError(400, "تم الدفع مسبقاً لهذا الحجز");

  const doctorProfile = await doctorDetailsModel.findOne({
    userId: appointment.doctorId._id,
  });

  const amount = doctorProfile?.consultationFee;
  if (!amount || amount <= 0)
    throw new SendError(400, "رسوم الاستشارة غير محددة");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `موعد مع د. ${appointment.doctorId.name}`,
            description: `التاريخ: ${new Date(appointment.date).toLocaleDateString("ar-EG")} | الوقت: ${appointment.timeSlot}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment._id.toString(),
      patientId: patientId.toString(),
    },
    success_url: `${process.env.BASE_URL}/micro/v1/webhooks/payment-success?appointmentId=${appointment._id}`,
    cancel_url: `${process.env.BASE_URL}/micro/v1/webhooks/payment-cancel?appointmentId=${appointment._id}`,
  });

  appointment.stripeSessionId = session.id;
  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "تم إنشاء جلسة الدفع",
    data: {
      checkoutUrl: session.url,
      sessionId: session.id,
    },
  });
});

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { appointmentId } = session.metadata;

    try {
      const appointment = await appointmentModel.findById(appointmentId);
      if (!appointment) {
        console.error(`Webhook: الحجز ${appointmentId} غير موجود`);
        return res.status(404).json({ message: "الحجز غير موجود" });
      }

      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
      await appointment.save();

      // 🔔 إشعار للمريض بعد الدفع
      await sendNotification({
        userId: appointment.patientId.toString(),
        title: "💳 تم استلام دفعتك بنجاح",
        body: `تم تأكيد موعدك ودفع الرسوم بنجاح. موعدك بتاريخ ${new Date(appointment.date).toLocaleDateString("ar-EG")} الساعة ${appointment.timeSlot}`,
        type: "payment",
        appointmentId: appointment._id,
      });
      console.log("✅ تم التحديث");

      console.log(`✅ Stripe: تم الدفع للحجز ${appointmentId} | $${session.amount_total / 100}`);
    } catch (err) {
      console.error("❌ خطأ في تحديث الداتابيز:", err);
      return res.status(500).json({ message: "خطأ في تحديث الحجز" });
    }
  }

  res.status(200).json({ received: true });
};

export const paymentSuccess = ErrorHandler(async (req, res) => {
  const { appointmentId } = req.query;

  const appointment = await appointmentModel
    .findById(appointmentId)
    .populate("doctorId", "name")
    .populate("patientId", "name");

  if (!appointment) throw new SendError(404, "الحجز غير موجود");

  res.status(200).json({
    status: "success",
    message: "تم الدفع بنجاح ✅",
    data: {
      appointmentId: appointment._id,
      patient: appointment.patientId.name,
      doctor: appointment.doctorId.name,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      paymentStatus: appointment.paymentStatus,
      status: appointment.status,
    },
  });
});

export const paymentCancel = ErrorHandler(async (req, res) => {
  const { appointmentId } = req.query;

  res.status(200).json({
    status: "cancelled",
    message: "تم إلغاء عملية الدفع. الحجز لا يزال موجوداً ويمكنك الدفع لاحقاً.",
    data: { appointmentId },
  });
});