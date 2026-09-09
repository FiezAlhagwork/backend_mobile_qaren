// features/history/history.controller.js
import * as historyService from "./history.service.js";
import { successResponse } from "../../shared/utils/response.js";
import { watchIdParamSchema } from "../watch/watch.validation.js"; // نفس تحقق الـ ObjectId، ما في داعي نكررها

export const getWatchHistory = async (req, res, next) => {
  try {
    const { id } = watchIdParamSchema.parse(req.params);
    const history = await historyService.getWatchHistory(req.localUser._id, id);
    return successResponse(res, 200, "History fetched", history);
  } catch (err) {
    next(err);
  }
};
