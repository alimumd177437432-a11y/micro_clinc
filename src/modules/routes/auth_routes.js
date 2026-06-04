import { Router } from "express";

import { addForResetPassword, getMyAcountData, login, newpassword, refreshAccessToken, signup, updateAcount, updatePassword } from "../controler/user_controler.js";
import { authentication } from "../../middelwares.js/auth_middelwares.js";

const authRouter = Router();


authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshAccessToken);

authRouter.get("/", authentication,getMyAcountData);
authRouter.put("/", authentication ,updateAcount);
authRouter.put("/password", authentication ,updatePassword);
authRouter.post("/ask-reset-password" ,addForResetPassword);
authRouter.post("/reset-password/:otpToken", newpassword);


export default authRouter;