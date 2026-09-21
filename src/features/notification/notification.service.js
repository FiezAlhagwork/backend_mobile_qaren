// features/notification/notification.service.js
import Notification from "./notification.model.js";

// أكتر من هيك ما بينعرض بالشاشة، والتنبيهات نادرة (واحد لكل مراقبة)
const FEED_LIMIT = 50;

/**
 * بينكتب من الكرون لما يتحقق هدف السعر.
 *
 * ما في حارس تكرار عن قصد: `recordPriceCheck` بيطفي المراقبة أول ما يتحقق
 * الهدف (watch.service.js)، فكل مراقبة بتوصل لهون مرة وحدة بعمرها.
 */
export const createTargetHitNotification = async ({ watch, price, store }) => {
  return Notification.create({
    userId: watch.userId,
    watchId: watch._id,
    productName: watch.productName,
    productImage: watch.productImage,
    price,
    targetPrice: watch.targetPrice,
    store,
  });
};

export const getUserNotifications = async (userId) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(FEED_LIMIT),
    // العدّاد على كل غير المقروء مش على الصفحة المعروضة بس — الشارة لازم
    // تبيّن الحقيقة حتى لو تجاوز العدد الحد
    Notification.countDocuments({ userId, readAt: null }),
  ]);

  return { notifications, unreadCount };
};

/** بترجّع عدد الصفوف يلي انعلّمت فعليًا — صفر يعني ما كان في غير مقروء */
export const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, readAt: null },
    { readAt: new Date() },
  );

  return { updated: result.modifiedCount };
};
