// features/notification/notification.routes.js
import { Router } from "express";
import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";
import { resolveLocalUser } from "../../shared/middlewares/resolveLocalUser.js";
import * as notificationController from "./notification.controller.js";

const router = Router();

// بدون rate limiter خاص: استعلام مونغو بس، بلا SerpAPI ولا Gemini —
// الـ generalLimiter بـ app.js كافي
router.use(requireAuthenticated, resolveLocalUser);

router.get("/", notificationController.getNotifications);
router.patch("/read", notificationController.markAllRead);

export default router;
