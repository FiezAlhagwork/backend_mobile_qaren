import User from "../../models/User.js";
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

export const deleteUserByClerkId = async (clerkId) => {
  return User.findOneAndDelete({ clerkId });
};

// ⬅ هدول بينادوهم من user.controller.js (endpoints عادية، جاي من التطبيق نفسه)
export const findUserByClerkId = async (clerkId) => {
  return User.findOne({ clerkId });
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
