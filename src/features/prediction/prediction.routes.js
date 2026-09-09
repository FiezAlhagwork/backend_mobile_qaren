import { Router } from "express";

import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";
import { aiLimiter } from "../../shared/middlewares/rateLimiters.js";
import * as predictionController from "./prediction.controller.js";

const router = Router();

// بدون resolveLocalUser عن قصد — التنبؤ ما بيقرأ أي بيانات خاصة بالمستخدم
// (لا موقع ولا تاريخ)، فجلب المستند المحلي بيكون استعلام DB بكل طلب بلا فايدة.
// requireAuthenticated لحالها كافية: بتتأكد إنه في جلسة Clerk صالحة
router.use(requireAuthenticated);

router.post("/", aiLimiter, predictionController.getPrediction);

export default router;
