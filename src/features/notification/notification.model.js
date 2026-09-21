// features/notification/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // للتنقّل لسجل الأسعار. بيصير null-safe لما المستخدم يحذف المراقبة —
    // الصف بيضل بالسجل بس بلا ضغط
    watchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Watch",
      default: null,
    },

    // ⬇ نسخة من بيانات المراقبة وقت التنبيه، مش مرجع إلها.
    // حذف المراقبة بيحذف الوثيقة فعليًا (watch.service.js → findOneAndDelete)،
    // فبدون النسخ بيصير السجل صفوف يتيمة بلا اسم ولا سعر
    productName: { type: String, required: true },
    productImage: { type: String, default: null },
    // السعر يلي حقّق الهدف، والهدف نفسه — التنين وقت الحدث مش وقت العرض
    price: { type: Number, required: true },
    targetPrice: { type: Number, required: true },
    store: { type: String, required: true },

    // null = غير مقروء. تاريخ بدل boolean عشان نعرف إيمتى انقرأ كمان
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// القائمة دايمًا: تنبيهات مستخدم واحد مرتّبة بالأحدث
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
