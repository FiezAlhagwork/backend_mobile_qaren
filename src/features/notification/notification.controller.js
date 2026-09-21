// features/notification/notification.controller.js
import * as notificationService from "./notification.service.js";
import { successResponse } from "../../shared/utils/response.js";

export const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(
      req.localUser._id,
    );

    return successResponse(res, 200, "Notifications fetched", data);
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllRead(req.localUser._id);

    return successResponse(res, 200, "Notifications marked as read", data);
  } catch (err) {
    next(err);
  }
};
