import { successResponse } from "../../shared/utils/response.js";
import {
  updateLocationSchema,
  updatePushTokenSchema,
  updatePreferencesSchema,
} from "./user.validation.js";
import {
  updateUserLocation,
  updatePushToken,
  updatePreferences,
} from "./user.service.js";

// `req.localUser` جاهز من resolveLocalUser — وهو بينشئ الصف من Clerk إذا كان
// ناقص، فما عاد في حاجة لبحث يدوي ولا لرمي 404 هون
export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, "User fetched", req.localUser);
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const parsed = updateLocationSchema.parse(req.body);

    const updatedUser = await updateUserLocation(
      req.localUser.clerkId,
      parsed,
    );

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
