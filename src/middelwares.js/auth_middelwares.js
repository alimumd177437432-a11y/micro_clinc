import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ErrorHandler, SendError } from "../services/errorhanderler.js";

dotenv.config();

export const authentication = ErrorHandler(async (req, res, next) => {
  const { token } = req.headers;

  if (!token) throw new SendError(401, "token is not found");

  jwt.verify(token, process.env.SECRET_KEY, async (error, decodedToken) => {
    if (error) {
      return next(new SendError(498, "token is not invalid "));
    }
    req.user = decodedToken;
    next();
  });
});

export const authoriziation = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return next(
        new SendError(403, "You do not have permission to access this route"),
      );
    }
    next();
  };
};
