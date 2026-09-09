import { clerkClient } from "@clerk/express";
import User from "../../models/User.js";
import PriceHistory from "../history/history.model.js";
import Watch from "../watch/watch.model.js";
import AppError from "../../shared/utils/AppError.js";

// ⬅ الثلاثة هدول بينادوهم بس من user.webhook.controller.js (أحداث Clerk)
export const createUserFromClerk = async (data) => {
  return User.create({
    clerkId: data.id,
    email: data.email_addresses?.[0]?.email_address,
    firstName: data.first_name,
    lastName: data.last_name,
    imageUrl: data.image_url,
  });
};

export const updateUserFromClerk = async (data) => {
  return User.findOneAndUpdate(
    { clerkId: data.id },
    {
      email: data.email_addresses?.[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    },
    { returnDocument: "after" },
  );
};

/**
 * حذف المستخدم بيجرّ معه مراقباته وسجل أسعارها.
 *
 * بدون هالتسلسل، المراقبات بتضل بقاعدة البيانات مربوطة بمستخدم ما عاد موجود
 * — وأسوأ من كونها بيانات ميتة، إنها بتضل `isActive: true` فالكرون بياخدها
 * بكل تشغيلة وبينادي SerpAPI إلها (نداء مدفوع) ونتيجته ما بتوصل لحدا.
 *
 * الترتيب مهم: سجل الأسعار بينمسح **قبل** المراقبات، لأن معرّفاتها هي
 * المفتاح يلي منلاقي فيه السجلات.
 */
export const deleteUserByClerkId = async (clerkId) => {
  const user = await User.findOneAndDelete({ clerkId });
  if (!user) return null;

  const watchIds = (await Watch.find({ userId: user._id }, { _id: 1 })).map(
    (watch) => watch._id,
  );

  if (watchIds.length > 0) {
    await PriceHistory.deleteMany({ watchId: { $in: watchIds } });
    await Watch.deleteMany({ _id: { $in: watchIds } });
    console.log(
      `[user.deleted] Removed ${watchIds.length} watches and their history for user ${user._id}`,
    );
  }

  return user;
};

// ⬅ هدول بينادوهم من user.controller.js (endpoints عادية، جاي من التطبيق نفسه)
export const findUserByClerkId = async (clerkId) => {
  return User.findOne({ clerkId });
};

/**
 * بترجّع المستخدم المحلي، وبتنشئه من Clerk إذا كان ناقص.
 *
 * ليش لازم: صف المستخدم عنا بينعمل **بس** من حدث `user.created` تبع الـ
 * webhook، وهو حدث بيصير مرة وحدة بالعمر. فأي شي بيخلّي الصف يضيع بعدها —
 * قاعدة بيانات جديدة، انتقال لـ Atlas، تنظيف، أو webhook كان مطفي وقت
 * التسجيل — بيقفل الحساب نهائيًا: Clerk بيسجّل الدخول عادي والتطبيق بيرد
 * 404 «ما لقينا حسابك على الخادم»، وما في أي طريقة للمستخدم يتعافى غير حذف
 * حسابه من Clerk وإعادة إنشائه.
 *
 * الرمز الموقّع من Clerk هو مصدر الحقيقة، فما في خطر أمني: منسأل Clerk عن
 * نفس المعرّف الموقّع، ولو ما بيعرفه منرجّع null والطبقة فوق بترمي 404.
 *
 * ⚠️ شكل البيانات هون **مش** نفس شكل الـ webhook: الـ Backend API بيرجّع
 * camelCase (`emailAddresses[].emailAddress`) بينما حمولة الـ webhook
 * snake_case (`email_addresses[].email_address`). عشان هيك في تحويل مستقل
 * هون بدل ما ننادي `createUserFromClerk`.
 */
export const ensureUserForClerkId = async (clerkId) => {
  const existing = await User.findOne({ clerkId });
  if (existing) return existing;

  let clerkUser;
  try {
    clerkUser = await clerkClient.users.getUser(clerkId);
  } catch (err) {
    console.warn(`[user] Clerk lookup failed for ${clerkId}: ${err.message}`);
    return null;
  }

  const email =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  // البريد مطلوب بالنموذج — بلا بريد الإنشاء رح يفشل، فمنوقف هون بوضوح
  if (!email) return null;

  try {
    const created = await User.create({
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    });
    console.log(`[user] Backfilled local user for ${clerkId}`);
    return created;
  } catch (err) {
    // 11000 = مفتاح مكرر: الـ webhook سبقنا بجزء من الثانية. مش خطأ — الصف
    // صار موجود وهاد بالضبط يلي بدنا ياه
    if (err.code === 11000) return User.findOne({ clerkId });
    throw err;
  }
};

export const updateUserLocation = async (clerkId, locationData) => {
  return User.findOneAndUpdate(
    { clerkId },
    {
      location: {
        ...locationData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
};

export const updatePreferences = async (clerkId, preferences) => {
  const user = await User.findOneAndUpdate(
    { clerkId },
    // مسار منقّط عشان ما ندعس بقية التفضيلات لما تنضاف لاحقًا
    { $set: { "preferences.pushNotificationsEnabled": preferences.pushNotificationsEnabled } },
    { new: true },
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updatePushToken = async (clerkId, pushToken) => {
  const user = await User.findOneAndUpdate(
    { clerkId },
    { pushToken },
    { new: true },
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
};
