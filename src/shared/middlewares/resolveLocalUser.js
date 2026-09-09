import { getAuth } from "@clerk/express";
import { ensureUserForClerkId } from "../../features/user/user.service.js";
import AppError from "../utils/AppError.js";

/**
 * بيحوّل جلسة Clerk لصف المستخدم عنا.
 *
 * `ensureUserForClerkId` بتنشئ الصف من Clerk إذا كان ناقص، بدل ما ترمي 404
 * على طول. هيك ما بيضل الحساب رهينة حدث `user.created` تبع الـ webhook — وهو
 * حدث بيصير مرة وحدة وما بينعاد، فأي قاعدة بيانات جديدة كانت بتقفل كل
 * الحسابات القديمة.
 */
export const resolveLocalUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const user = await ensureUserForClerkId(userId);
    if (!user) {
      throw new AppError("User not found in local database", 404);
    }

    req.localUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
