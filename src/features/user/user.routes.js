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

router.get("/me", requireAuthenticated, getMe);
router.patch("/location", requireAuthenticated, updateLocation);
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
