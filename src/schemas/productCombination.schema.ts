import { variantValuesSchema } from "./variant.schema";
import { inventorySchema } from "./inventory.schema";
import { productBaseSchema } from "./product.schema";
import z from "zod";

export const productCombinationBaseSchema = z.object({
  id: z.number().optional().nullish(),
  productId: z.number(),
  unit: z.string(),
  conversionFactor: z.number().min(1, {
    message: "Conversion Factor must be at least 1.",
  }),
  price: z.number().optional(),
  reorderLevel: z.number(),
  isBreakPack: z.boolean().nullish(),
  isActive: z.boolean().nullish(),
  values: z.array(variantValuesSchema),
  isBreakPackOfId: z.number().nullish(),
});

export const productCombinationsSchema = productCombinationBaseSchema.extend({
  sku: z.string(),
  id: z.number(),
  name: z.string(),
  inventory: inventorySchema,
  product: productBaseSchema,
});

export type ProductCombinationInput = z.infer<
  typeof productCombinationBaseSchema
>;
export type ProductCombinations = z.infer<typeof productCombinationsSchema>;
