import { z } from "zod";

// ⬅ نفس مدخل المنتج لفيتشري recommendation/ و prediction/ — الاتنين بياخدوا
// منتج من نتيجة البحث وبيبعتوه لـ Gemini، فعشان هيك هو بـ shared/
//
// حدود الطول مش بس للتحقق — هي خط الدفاع الأول ضد prompt injection وتضخّم
// الـ payload، لأن هالبيانات بتروح مباشرة لـ Gemini
export const productInputSchema = z
  .object({
    productId: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    price: z.number().positive(),
    store: z.string().max(100).optional(),
    category: z.string().max(100).optional(),
    rating: z.number().min(0).max(5).nullable().optional(),
    reviews: z.number().nonnegative().nullable().optional(),
  })
  .strict();
