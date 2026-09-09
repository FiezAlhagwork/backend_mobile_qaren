// watch.routes.js
import { Router } from "express";
import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";
import { resolveLocalUser } from "../../shared/middlewares/resolveLocalUser.js";

import { createWatchSchema, watchIdParamSchema } from "./watch.validation.js";
import * as watchController from "./watch.controller.js";

const router = Router();

router.use(requireAuthenticated, resolveLocalUser);

router.get("/", watchController.getUserWatches);
router.post("/", watchController.createWatch);
router.delete("/:id", watchController.deleteWatch);

export default router;
