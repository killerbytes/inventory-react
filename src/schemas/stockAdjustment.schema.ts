import { productCombinationsSchema } from "./productCombination.schema";
import z from "zod";

export const stockAdjustmentSchema = z.object({
  referenceNo: z.string().nullish(),
  combinationId: z.number(),
  combination: productCombinationsSchema.optional(),
  systemQuantity: z.number().nullish(),
  newQuantity: z.coerce.number().min(0, {
    message: "New Quantity must be at least 0.",
  }),

  difference: z.number().nullish(),
  reason: z.string(),
  notes: z.string().min(1, {
    message: "Notes is required.",
  }),
  createdAt: z.string().nullish(),
  createdBy: z.number().nullish(),
});
export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;
