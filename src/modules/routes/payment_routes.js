import { Router } from "express";
import { handleStripeWebhook, paymentSuccess, paymentCancel } from "../controler/payment_controler.js";

const webhookRouter = Router();

webhookRouter.post("/stripe", handleStripeWebhook);
webhookRouter.get("/payment-success", paymentSuccess);
webhookRouter.get("/payment-cancel", paymentCancel);

export default webhookRouter;