// features/history/history.routes.js
import { Router } from "express";
import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";
import { resolveLocalUser } from "../../shared/middlewares/resolveLocalUser.js";
import * as historyController from "./history.controller.js";

const router = Router();
router.use(requireAuthenticated, resolveLocalUser);
router.get("/:id", historyController.getWatchHistory);

export default router;