import { productCombinationSchema } from "./productCombination.schema";
import z from "zod";

export const priceHistorySchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  combinations: productCombinationSchema,
  fromPrice: z.number(),
  toPrice: z.number(),
  changedBy: z.number(),
  changedAt: z.string(),
  user: z.any(),
  quantity: z.coerce.number(),
});

export type PriceHistory = z.infer<typeof priceHistorySchema>;
