import { variantValuesSchema } from "./variant.schema";
import { inventorySchema } from "./inventory.schema";
import { productBaseSchema } from "./product.schema";
import z from "zod";

export const productCombinationBaseSchema = z.object({
  productId: z.number(),
  name: z.string(),
  sku: z.string(),
  unit: z.string(),
});

export const productCombinationsSchema = productCombinationBaseSchema.extend({
  id: z.number(),
  conversionFactor: z.coerce.number().min(1, {
    message: "Conversion Factor must be at least 1.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "Price must be at least 0.01.",
  }),
  inventory: inventorySchema,
  product: productBaseSchema,
  reorderLevel: z.coerce.number(),
  isBreakPack: z.boolean().nullish(),
  isActive: z.boolean().nullish(),
  values: z.array(variantValuesSchema),
  isBreakPackOfId: z.coerce.number().nullish(),
});

export const productCombinationUpdateSchema = productCombinationsSchema
  .extend({
    id: z.number().optional(),
    conversionFactor: z.coerce.number().min(1, {
      message: "Conversion Factor must be at least 1.",
    }),
    price: z.coerce.number().optional(),
    reorderLevel: z.coerce.number(),
    isBreakPack: z.boolean().nullish(),
    isActive: z.boolean().nullish(),
    values: z.array(variantValuesSchema),
    isBreakPackOfId: z.coerce.number().nullish(),
  })
  .omit({
    product: true,
    inventory: true,
    name: true,
    sku: true,
  });

export type ProductCombinations = z.infer<typeof productCombinationsSchema>;
export type ProductCombinationUpdate = z.infer<
  typeof productCombinationUpdateSchema
>;
