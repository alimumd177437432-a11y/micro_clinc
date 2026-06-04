import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.config();


import { userModel } from "../models/user_model.js";
import { ErrorHandler, SendError } from "../../services/errorhanderler.js";
import { resetPasswordEmail } from "../../utils/nodemailer/resendEmailForResetPassword.js";


export const signup = ErrorHandler(async (req, res) => {
  const { password } = req.body;
  const hashedPassword = bcrypt.hashSync(
    password,
    parseInt(process.env.HASHINGALT) || 10,
  );
  const create = await userModel.create({
    ...req.body,
    password: hashedPassword,
  });

  if (!create) throw new SendError(400, "bad Request");
  const userResponse = create.toObject();
delete userResponse.password;

  res.status(201).json({
    status: "success",
    message: "Created successfully",
    data: userResponse,
  });
});

export const updateAcount = ErrorHandler(async (req, res) => {
  const { email: oldEmail } = req.user;
  const { email, phone, birthDate, name } = req.body;
  const updateUser = await userModel.findOneAndUpdate(
    { email: oldEmail },
    { email, phone, birthDate, name },
    { returnDocument: "after" },
  );
  if (!updateUser) throw new SendError(400, "Error is updating acount data");
  res.status(200).json({
    message: "success",
    data: updateUser,
  });
});
export const updatePassword = ErrorHandler(async (req, res) => {
  const { email } = req.user;
  const { password } = req.body;
  const hashPassword = bcrypt.hashSync(
    password,
    parseInt(process.env.HASHINGALT) || 10,
  );
  const updatePass = await userModel.findOneAndUpdate(
    { email },
    { password: hashPassword },
    { returnDocument: "after" }
  );
  if (!updatePass) throw new SendError(400, "Error is updating  password");
  res.status(200).json({
    message: "success",
    data: updatePass,
  });
});
export const getMyAcountData = ErrorHandler(async (req, res) => {
  const { email } = req.user;
  const getData = await userModel.findOne({ email }, { password: 0 });
  if (!getData) throw new SendError(400, "Error is geting  your data");
  res.status(200).json({
    message: "success",
    data: getData,
  });
});

export const login = ErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new SendError(401, "Invalid email or password"));
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return next(new SendError(401, "Invalid email or password"));
  }

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone : user.phone
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "30d" }
  );

  user.refreshToken = refreshToken;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    message: "Login successful",
    token,
    refreshToken,
    data : userResponse
  });
});

// ── Refresh Token Endpoint ──────────────────────────────

export const refreshAccessToken = ErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return next(new SendError(401, "Refresh token is required"));

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
  } catch {
    return next(new SendError(401, "Invalid or expired refresh token"));
  }

  const user = await userModel.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return next(new SendError(401, "Refresh token is not valid"));
  }

  const newToken = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone : user.phone
    },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    message: "Token refreshed successfully",
    token: newToken,
  });
});
//reset password
// 1 - verify
// 2 - otp
// 3 - new password

export const addForResetPassword = ErrorHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await userModel.findOne({ email });
  if (!findUser) throw new SendError(400, "Error asking for reset password");
  const { otpToken } = await resetPasswordEmail(findUser.email);
  res.json({
    message: "success , cheak your mail ",
    otpToken : otpToken
  });
});

export const newpassword = ErrorHandler(async (req, res) => {
  const { password, otp } = req.body;
  const { otpToken } = req.params;
  const decoded = jwt.verify(otpToken, process.env.SECRET_KEY);
if (otp !== decoded.otp) throw new SendError(400, " otp is not vallied ");  const hashedPassword = bcrypt.hashSync(
    password,
    parseInt(process.env.HASHINGALT) || 10,
  );
  const updatePass = await userModel.findOneAndUpdate(
    { email: decoded.email },
    { password: hashedPassword },
  );
  if (!updatePass) throw new SendError(404, "the user is not found");
  res.json({
    message: "password reset successfly",
  });
});

