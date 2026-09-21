import cron from "node-cron";
import * as watchService from "./watch.service.js";
import * as historyService from "../history/history.service.js"; // + جديد
import * as notificationService from "../notification/notification.service.js";
import { getProductDetails } from "../../shared/services/serpapi.service.js";
import { sendPushNotification } from "../../shared/services/push.service.js";
import User from "../../models/User.js";

const getCheapestOffer = (stores) => {
  if (!stores || stores.length === 0) return null;
  return stores.reduce((cheapest, store) =>
    store.extracted_price < cheapest.extracted_price ? store : cheapest,
  );
};

/**
 * سطر واحد بيلخّص الفشل مع العدّاد، وبيقول صراحةً لما المراقبة تنطفي.
 * قبلها كان الفشل بيطلع كتحذير بلا سياق، فما في طريقة تعرف إذا هي مشكلة
 * عابرة ولا مراقبة ميتة من أسابيع.
 */
const registerFailure = async (watch, reason) => {
  const { failures, deactivated } = await watchService.registerCheckFailure(
    watch._id,
  );

  if (deactivated) {
    console.error(
      `[watch-cron] Watch ${watch._id} deactivated after ${failures} consecutive failures — last reason: ${reason}`,
    );
    return;
  }

  console.warn(
    `[watch-cron] Watch ${watch._id} failed (${failures}/3) — ${reason}`,
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
      // مش «تخطّي» — هاد فشل فحص. رد بلا متاجر يعني المنتج ما عاد معروض،
      // ولو ضل يتكرر لازم المراقبة تنطفي بدل ما تضل تستهلك نداءات
      await registerFailure(watch, "no stores returned");
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
      // السجل أولًا وخارج شرط الـ push تحت. الـ push محاولة أفضل-جهد —
      // بتعتمد على تفضيل المستخدم وعلى وجود توكن، وExpo Go ما بيستقبلها
      // إطلاقًا. لو ربطنا الحفظ فيها، شاشة الإشعارات بتضل فاضية للأبد
      await notificationService.createTargetHitNotification({
        watch,
        price: cheapest.extracted_price,
        store: cheapest.name,
      });

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

    await registerFailure(watch, err.message);
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
