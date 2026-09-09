import cron from "node-cron";
import * as watchService from "./watch.service.js";
import * as historyService from "../history/history.service.js"; // + جديد
import { getProductDetails } from "../../shared/services/serpapi.service.js";
import { sendPushNotification } from "../../shared/services/push.service.js";
import User from "../../models/User.js";

const getCheapestOffer = (stores) => {
  if (!stores || stores.length === 0) return null;
  return stores.reduce((cheapest, store) =>
    store.extracted_price < cheapest.extracted_price ? store : cheapest,
  );
};

const processWatch = async (watch) => {
  try {
    const details = await getProductDetails({
      productId: watch.productId,
      productToken: watch.productToken,
    });

    const cheapest = getCheapestOffer(details.product_results?.stores);
    if (!cheapest) {
      console.warn(
        `[watch-cron] No stores returned for watch ${watch._id}, skipping`,
      );
      return;
    }

    const { targetHit } = await watchService.recordPriceCheck(
      watch._id,
      cheapest.extracted_price,
      cheapest.name,
    );

    // + جديد: تسجيل القراءة بـ history/ — بعد نجاح recordPriceCheck مباشرة،
    // بنفس السعر والمتجر يلي استخدمناهن فوق (مصدر وحيد للحقيقة، مافي حساب مكرر)
    await historyService.logPriceReading(
      watch._id,
      cheapest.extracted_price,
      cheapest.name,
    );

    if (targetHit) {
      const user = await User.findById(watch.userId);
      if (user?.preferences?.pushNotificationsEnabled && user?.pushToken) {
        await sendPushNotification(user.pushToken, {
          title: "Price drop! 🎉",
          body: `${watch.productName} is now ${cheapest.price} at ${cheapest.name}`,
          data: { watchId: watch._id.toString(), productId: watch.productId },
        });
      }
    }
  } catch (err) {
    if (err.statusCode === 410) {
      await watchService.deactivateWatch(watch._id);
      console.warn(
        `[watch-cron] Watch ${watch._id} deactivated — expired product token`,
      );
      return;
    }

    console.error(
      `[watch-cron] Failed to process watch ${watch._id}:`,
      err.message,
    );
  }
};

export const runWatchCron = async () => {
  const watches = await watchService.getActiveWatchesBatch();
  console.log(`[watch-cron] Processing ${watches.length} active watches`);

  for (const watch of watches) {
    await processWatch(watch);
  }

  console.log("[watch-cron] Done");
};

export const startWatchCron = () => {
  cron.schedule("0 0 * * *", () => {
    console.log("[watch-cron] Starting daily run");
    runWatchCron().catch((err) =>
      console.error("[watch-cron] Fatal error:", err),
    );
  });
};
