import { getAuth } from "@clerk/express";
import { findUserByClerkId } from "../../features/user/user.service.js";
import AppError from "../utils/AppError.js";

export const resolveLocalUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const user = await findUserByClerkId(userId);
    if (!user) {
      throw new AppError("User not found in local database", 404);
    }
    req.localUser = user;
    next();
  } catch (err) {
    next(err);
  }
};