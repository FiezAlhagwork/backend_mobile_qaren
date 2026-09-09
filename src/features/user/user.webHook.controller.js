import { Webhook } from "svix";
import { env } from "../../config/env.js";
import AppError from "../../shared/utils/AppError.js";
import { successResponse } from "../../shared/utils/response.js";
import {
  createUserFromClerk,
  updateUserFromClerk,
  deleteUserByClerkId,
} from "./user.service.js";

export const handleUserWebhook = async (req, res, next) => {
  console.log("1. Webhook received");
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event;
  try {
    event = webhook.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
  } catch (err) {
    return next(new AppError("Invalid webhook signature", 400));
  }

  try {
    const { type, data } = event;

    switch (type) {
      case "user.created":
        await createUserFromClerk(data);
        break;
      case "user.updated":
        await updateUserFromClerk(data);
        break;
      case "user.deleted":
        await deleteUserByClerkId(data.id);
        break;
    }

    return successResponse(res, 200, "Webhook processed");
  } catch (err) {
    next(err);
  }
};
