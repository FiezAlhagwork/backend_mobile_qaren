import { getAuth } from "@clerk/express";
import AppError from "../../shared/utils/AppError.js";
import { findUserByClerkId } from "./user.service.js";

export const requireLocation = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const user = await findUserByClerkId(userId);
    if (!user) {
      throw new AppError("User not found in local database", 404);
    }

    if (!user.location?.city || !user.location?.country) {
      throw new AppError("Location must be set before using this feature", 403);
    }

    req.localUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
