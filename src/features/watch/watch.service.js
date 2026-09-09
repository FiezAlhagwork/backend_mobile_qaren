import Watch from "./watch.model.js";
import AppError from "../../shared/utils/AppError.js";

const WATCH_DURATION_DAYS = 30;

export const createWatch = async (userId, data) => {
  const expiresAt = new Date(
    Date.now() + WATCH_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );
  return Watch.create({ userId, ...data, expiresAt });
};

export const getUserWatches = async (userId) => {
  return Watch.find({ userId }).sort({ createdAt: -1 });
};

export const deleteWatch = async (userId, watchId) => {
  const watch = await Watch.findOneAndDelete({ _id: watchId, userId });
  if (!watch) throw new AppError("Watch not found", 404);
  return watch;
};

export const getActiveWatchesBatch = async () => {
  return Watch.find({ isActive: true, expiresAt: { $gt: new Date() } });
};

export const deactivateWatch = async (watchId) => {
  return Watch.findByIdAndUpdate(watchId, { isActive: false });
};

export const recordPriceCheck = async (
  watchId,
  cheapestPrice,
  cheapestStoreName,
) => {
  const watch = await Watch.findById(watchId);
  if (!watch) return { watch: null, targetHit: false };

  watch.lastCheckedPrice = cheapestPrice;
  watch.lastCheckedAt = new Date();
  watch.store = cheapestStoreName;

  const targetHit = cheapestPrice <= watch.targetPrice;
  if (targetHit) {
    watch.notifiedAt = new Date();
    watch.isActive = false;
  }

  await watch.save();
  return { watch, targetHit };
};
