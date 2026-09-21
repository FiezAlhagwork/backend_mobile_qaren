import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";



import { env } from "./config/env.js";
import { generalLimiter } from "./shared/middlewares/rateLimiters.js";
import { sanitizeParams } from "./shared/middlewares/sanitizeParams.js";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/middlewares/errorHandler.js";

import userWebhookRoutes from "./features/user/user.webHook.routes.js";
import userRoutes from "./features/user/user.routes.js";
import productRoutes from './features/product/product.routes.js';
import watchRoutes from './features/watch/watch.routes.js';
import historyRoutes from './features/history/history.routes.js';
import recommendationRoutes from './features/recommendation/recommendation.routes.js';
import predictionRoutes from './features/prediction/prediction.routes.js';
import notificationRoutes from './features/notification/notification.routes.js';

const app = express();

// مطلوبة عشان express-rate-limit يقرأ IP المستخدم الحقيقي خلف proxy/tunnel،
// مش IP الـ proxy (يلي بيخلي كل المستخدمين يتشاركوا نفس العدّاد).
// 1 = الثقة بأول hop بس — مش true يلي بيخلي انتحال X-Forwarded-For ممكن
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  "/api/webhooks/user",
  express.raw({ type: "application/json" }),
  userWebhookRoutes,
);

app.use(express.json({ limit: "10kb" }));
app.use(sanitizeParams);
app.use(generalLimiter);



app.use(clerkMiddleware());

// Feature routes
app.use("/api/user", userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/watches', watchRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

