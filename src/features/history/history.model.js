// features/history/history.model.js
import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  watchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Watch",
    required: true,
  },
  price: { type: Number, required: true },
  store: { type: String, required: true },
  checkedAt: { type: Date, default: Date.now },
});

priceHistorySchema.index({ watchId: 1, checkedAt: -1 });

export default mongoose.model("PriceHistory", priceHistorySchema);