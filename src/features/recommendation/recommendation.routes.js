import { Router } from "express";

import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";
import { resolveLocalUser } from "../../shared/middlewares/resolveLocalUser.js";
import { aiLimiter } from "../../shared/middlewares/rateLimiters.js";
import * as recommendationController from "./recommendation.controller.js";

const router = Router();

router.use(requireAuthenticated, resolveLocalUser);

router.post("/", aiLimiter, recommendationController.getRecommendation);

export default router;
