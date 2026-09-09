import mongoose from "mongoose";

const watchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: { type: String, required: true },
    productToken: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: null },
    store: { type: String, required: true },

    priceAtAdd: { type: Number, required: true },
    targetPrice: { type: Number, required: true },
    lastCheckedPrice: { type: Number, default: null },
    lastCheckedAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
    /**
     * فحوصات فاشلة متتالية. بترجع صفر مع أول فحص ناجح، وعند وصولها للحد
     * بتنطفي المراقبة — بدونها المراقبة يلي بتفشل كل ليلة بتضل تبيّن «نشطة»
     * للمستخدم للأبد وبتاكل نداء SerpAPI بكل تشغيلة
     */
    consecutiveFailures: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

watchSchema.index({ userId: 1, productId: 1 }, { unique: true });
watchSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.model("Watch", watchSchema);
