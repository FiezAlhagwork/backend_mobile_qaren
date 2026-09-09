import { Router } from "express";

import { requireAuthenticated } from "../../shared/middlewares/requireAuthenticated.js";
import { externalApiLimiter } from "../../shared/middlewares/rateLimiters.js";
import { requireLocation } from "../user/user.middleware.js";
import { searchProducts, getProductDetails } from "./product.controller.js";

const router = Router();

router.get(
  "/search",
  requireAuthenticated,
  externalApiLimiter,
  requireLocation,
  searchProducts,
);

// بدون requireLocation عن قصد — التفاصيل بتنجلب بالـ productToken لوحده،
// وSerpAPI ما بتاخد موقع بهالـ engine. بس externalApiLimiter ضروري لأنه
// نداء مدفوع
router.get(
  "/:id/details",
  requireAuthenticated,
  externalApiLimiter,
  getProductDetails,
);

export default router;
