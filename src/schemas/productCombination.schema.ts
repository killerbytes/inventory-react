import { variantValuesSchema } from "./variant.schema";
import { inventorySchema } from "./inventory.schema";
import { productSchema } from "./product.schema";
import z from "zod";

export const productCombinationBaseSchema = z.object({
  productId: z.number(),
  unit: z.string(),
  conversionFactor: z.coerce.number().min(1, {
    message: "Conversion Factor must be at least 1.",
  }),
  price: z.coerce.number().optional(),
  reorderLevel: z.number(),
  isBreakPack: z.boolean().optional(),
  isActive: z.boolean().optional(),
  values: z.array(variantValuesSchema),
  isBreakPackOfId: z.number().optional().nullish(),
});

export const productCombinationInputSchema =
  productCombinationBaseSchema.extend({
    id: z.number().optional(),
  });

export const productCombinationsFormSchema =
  productCombinationBaseSchema.extend({
    id: z.number().optional(),
    isBreakPack: z.boolean().nullish(),
    isActive: z.boolean().nullish(),
    inventory: inventorySchema.nullish(),
    product: z.lazy(() => productSchema).nullish(),
  });

export const productCombinationsSchema = productCombinationsFormSchema.extend({
  sku: z.string(),
  name: z.string(),
  inventory: inventorySchema,
  product: z.lazy(() => productSchema),
});

export type ProductCombinationInput = z.infer<
  typeof productCombinationInputSchema
>;

export type ProductCombinationsForm = z.infer<
  typeof productCombinationsFormSchema
>;
export type ProductCombinations = z.infer<typeof productCombinationsSchema>;
