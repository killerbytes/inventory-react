import { productCombinationsSchema } from "./productCombination.schema";
import z from "zod";

export const priceHistorySchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  combinations: productCombinationsSchema,
  fromPrice: z.number(),
  toPrice: z.number(),
  changedBy: z.number(),
  changedAt: z.string(),
  user: z.any(),
  quantity: z.coerce.number(),
});

export type PriceHistory = z.infer<typeof priceHistorySchema>;
