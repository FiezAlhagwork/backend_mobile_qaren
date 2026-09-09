import { z } from 'zod';

// ⬅ productToken هو immersive_product_page_token الجاي من نتيجة البحث.
// طويل (مئات الحروف) فالحد الأعلى واسع عن قصد
export const productDetailsSchema = z.object({
  id: z.string().min(1).max(100),
  productToken: z.string().min(1).max(4000),
});

export const searchProductsSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
}).refine(
  (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
  { message: 'minPrice must be less than or equal to maxPrice', path: ['minPrice'] }
);