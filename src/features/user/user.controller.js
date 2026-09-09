import { getAuth } from "@clerk/express";
import AppError from "../../shared/utils/AppError.js";
import { successResponse } from "../../shared/utils/response.js";
import {
  updateLocationSchema,
  updatePushTokenSchema,
  updatePreferencesSchema,
} from "./user.validation.js";
import {
  findUserByClerkId,
  updateUserLocation,
  updatePushToken,
  updatePreferences,
} from "./user.service.js";

export const getMe = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const user = await findUserByClerkId(userId);
    if (!user) {
      throw new AppError("User not found in local database", 404);
    }

    return successResponse(res, 200, "User fetched", user);
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const parsed = updateLocationSchema.parse(req.body);

    const updatedUser = await updateUserLocation(userId, parsed);
    if (!updatedUser) {
      throw new AppError("User not found in local database", 404);
    }

    return successResponse(res, 200, "Location updated", updatedUser.location);
  } catch (err) {
    next(err);
  }
};

export const updatePushTokenExpo = async (req, res, next) => {
  try {
    const { pushToken } = updatePushTokenSchema.parse(req.body);
    const user = await updatePushToken(
      req.localUser.clerkId,
      pushToken,
    );
    return successResponse(res, 200, "Push token updated", user);
  } catch (err) {
    next(err);
  }
};

export const updateUserPreferences = async (req, res, next) => {
  try {
    const parsed = updatePreferencesSchema.parse(req.body);

    const user = await updatePreferences(req.localUser.clerkId, parsed);

    return successResponse(res, 200, "Preferences updated", user.preferences);
  } catch (err) {
    next(err);
  }
};
