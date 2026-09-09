import * as watchService from "./watch.service.js";
import { successResponse } from "../../shared/utils/response.js";
import { createWatchSchema, watchIdParamSchema } from "./watch.validation.js";

export const createWatch = async (req, res, next) => {
  try {
    const data = createWatchSchema.parse(req.body);
    const watch = await watchService.createWatch(req.localUser._id, data);
    return successResponse(res, 201, "Watch created", watch);
  } catch (err) {
    next(err);
  }
};

export const getUserWatches = async (req, res, next) => {
  try {
    const watches = await watchService.getUserWatches(req.localUser._id);
    return successResponse(res, 200, "Watches fetched", watches);
  } catch (err) {
    next(err);
  }
};

export const deleteWatch = async (req, res, next) => {
  try {
    const { id } = watchIdParamSchema.parse(req.params);
    await watchService.deleteWatch(req.localUser._id, id);
    return successResponse(res, 200, "Watch deleted");
  } catch (err) {
    next(err);
  }
};