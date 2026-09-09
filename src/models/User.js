// features/user/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: { type: String, required: true },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    imageUrl: { type: String, default: null },

    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      city: { type: String, default: null },
      country: { type: String, default: null },
      source: { type: String, enum: ["gps", "manual"], default: null },
      updatedAt: { type: Date, default: null },
    },

    preferences: {
      pushNotificationsEnabled: { type: Boolean, default: true },
    },

    pushToken: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
