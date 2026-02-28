import { variantValuesSchema } from "./variant.schema";
import { inventorySchema } from "./inventory.schema";
import { productSchema } from "./product.schema";
import z from "zod";

export const productCombinationBaseSchema = z.object({
  productId: z.number(),
  unit: z.string(),
  id: z.number().optional().nullish(),
});

export const productCombinationFormSchema = productCombinationBaseSchema.extend(
  {
    conversionFactor: z.coerce.number().min(1, {
      message: "Conversion Factor must be at least 1.",
    }),
    price: z.coerce.number().optional(),
    reorderLevel: z.number(),
    isBreakPack: z.boolean().nullish(),
    isActive: z.boolean().nullish(),
    values: z.array(variantValuesSchema),
    isBreakPackOfId: z.number().nullish(),
  },
);

export const productCombinationsSchema = productCombinationBaseSchema.extend({
  sku: z.string(),
  id: z.number(),
  name: z.string(),
  inventory: inventorySchema,
  product: z.lazy(() => productSchema),
});

export type ProductCombinationInput = z.infer<
  typeof productCombinationBaseSchema
>;
export type ProductCombinationsForm = z.infer<
  typeof productCombinationFormSchema
>;
export type ProductCombinations = z.infer<typeof productCombinationsSchema>;
