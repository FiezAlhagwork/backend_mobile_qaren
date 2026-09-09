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

/** بعدها المراقبة بتنطفي — تلات ليالي فشل متتالي كافية للحكم إنها ميتة */
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * فشل فحص واحد. بترجّع `{ failures, deactivated }` عشان الكرون يقدر يسجّل
 * سطر مفهوم بدل ما يبلع الخطأ.
 *
 * السبب: قبلها كان الفشل بيمرق بـ `console.warn` وبس — ولا أثر منه بقاعدة
 * البيانات ولا بالتطبيق. يعني مراقبة بتفشل من شهر بتضل معروضة «نشطة»
 * وبتستهلك نداء مدفوع كل ليلة، وما في طريقة تعرف فيها إنها ميتة.
 */
export const registerCheckFailure = async (watchId) => {
  const watch = await Watch.findById(watchId);
  if (!watch) return { failures: 0, deactivated: false };

  watch.consecutiveFailures += 1;

  const deactivated = watch.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES;
  if (deactivated) watch.isActive = false;

  await watch.save();
  return { failures: watch.consecutiveFailures, deactivated };
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
  // فحص ناجح بيمسح تاريخ الفشل — العدّاد للفشل **المتتالي** مش التراكمي
  watch.consecutiveFailures = 0;

  const targetHit = cheapestPrice <= watch.targetPrice;
  if (targetHit) {
    watch.notifiedAt = new Date();
    watch.isActive = false;
  }

  await watch.save();
  return { watch, targetHit };
};
