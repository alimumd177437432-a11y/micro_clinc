import { Router } from "express";
import { addForResetPassword, getMyAcountData, login, newpassword, refreshAccessToken, signup, updateAcount, updatePassword } from "../controler/user_controler.js";
import { authentication } from "../../middelwares.js/auth_middelwares.js";
import { authLimiter } from "../../middelwares.js/rateLimiter.js";
import { validate } from "../../middelwares.js/validate.js";
import { loginSchema, newPasswordSchema, resetPasswordSchema, signupSchema } from "../../middelwares.js/schemas.js";

const authRouter = Router();

authRouter.post("/signup", authLimiter, validate(signupSchema), signup);
authRouter.post("/login", authLimiter, validate(loginSchema), login);
authRouter.post("/refresh-token", refreshAccessToken);

authRouter.get("/", authentication, getMyAcountData);
authRouter.put("/", authentication, updateAcount);
authRouter.put("/password", authentication, updatePassword);
authRouter.post("/ask-reset-password", authLimiter, validate(resetPasswordSchema), addForResetPassword);
authRouter.post("/reset-password/:otpToken", validate(newPasswordSchema), newpassword);

export default authRouter;