import { z } from "zod";

export const createWatchSchema = z.object({
  productId: z.string().min(1),
  productToken: z.string().min(1),
  productName: z.string().min(1),
  productImage: z.string().url().nullable().optional(),
  store: z.string().min(1),
  priceAtAdd: z.number().positive(),
  targetPrice: z.number().positive(),
}).strict();

export const watchIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid watch id"),
}).strict();