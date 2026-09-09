
import PriceHistory from "./history.model.js";
import Watch from "../watch/watch.model.js";
import AppError from "../../shared/utils/AppError.js";

export const logPriceReading = async (watchId, price, store) => {
  return PriceHistory.create({ watchId, price, store });
};

export const getWatchHistory = async (userId, watchId, days = 30) => {
  const watch = await Watch.findOne({ _id: watchId, userId });
  if (!watch) throw new AppError("Watch not found", 404);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const dataPoints = await PriceHistory.find({
    watchId,
    checkedAt: { $gte: since },
  }).sort({ checkedAt: 1 });

  if (dataPoints.length === 0) {
    return { dataPoints: [], stats: null };
  }

  const prices = dataPoints.map((d) => d.price);
  const stats = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round((prices.reduce((sum, p) => sum + p, 0) / prices.length) * 100) / 100,
  };

  return { dataPoints, stats };
};

// ⬅ لفيتشرات الذكاء الاصطناعي (recommendation/ و prediction/): بترجع التاريخ
// لمنتج **لو** المستخدم مراقبو، وnull غير هيك — **بدون رمي خطأ**، لأن غياب
// التاريخ حالة عادية تمامًا هناك (التاريخ إشارة إضافية، مش شرط مسبق).
// getWatchHistory فوق بترمي 404، فما بتنفع مباشرة لهالحالة.
export const getOptionalHistoryForProduct = async (userId, productId) => {
  const watch = await Watch.findOne({ userId, productId });
  if (!watch) return { watchId: null, history: null };

  const { dataPoints, stats } = await getWatchHistory(userId, watch._id);
  if (!stats) return { watchId: watch._id, history: null };

  return {
    watchId: watch._id,
    history: {
      daysTracked: dataPoints.length,
      minPrice: stats.min,
      maxPrice: stats.max,
      avgPrice: stats.avg,
      readings: dataPoints.map((d) => ({
        date: d.checkedAt.toISOString().split("T")[0],
        price: d.price,
        store: d.store,
      })),
    },
  };
};