import { Router } from "express";

import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";

import {
  getMe,
  updateLocation,
  updatePushTokenExpo,
  updateUserPreferences,
} from "./user.controller.js";
import { resolveLocalUser } from "../../shared/middlewares/resolveLocalUser.js";

const router = Router();

// resolveLocalUser على الاتنين كمان: بينشئ الصف من Clerk إذا كان ناقص بدل ما
// يرمي 404. بدونها، أول نداء بعد التسجيل (`/me`) بيفشل لما يكون الـ webhook
// ما وصل — وهاد بيصير دايمًا بالتطوير المحلي، لأن Clerk ما بتقدر توصل
// لـ localhost. كانوا المسارين الوحيدين بلا هالحماية
router.get("/me", requireAuthenticated, resolveLocalUser, getMe);
router.patch(
  "/location",
  requireAuthenticated,
  resolveLocalUser,
  updateLocation,
);
router.patch(
  "/push-token",
  requireAuthenticated,
  resolveLocalUser,
  updatePushTokenExpo,
);
router.patch(
  "/preferences",
  requireAuthenticated,
  resolveLocalUser,
  updateUserPreferences,
);

export default router;
