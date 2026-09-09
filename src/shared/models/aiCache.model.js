import mongoose from "mongoose";

// ⬅ كاش مشترك لنتائج Gemini — مستخدم من recommendation/ و prediction/،
// عشان هيك هو بـ shared/ مش جوا فيتشر واحد
const aiCacheSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["recommendation", "prediction"],
      required: true,
    },
    // rec:<productId> (global لكل المستخدمين) أو pred:<watchId> (per-watch)
    cacheKey: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

aiCacheSchema.index({ kind: 1, cacheKey: 1 }, { unique: true });

// MongoDB بيمسح السجل تلقائيًا لما يوصل expiresAt — بدون أي cron أو تنظيف يدوي
aiCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AiCache", aiCacheSchema);
