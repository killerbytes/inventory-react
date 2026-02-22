import { productCombinationsSchema } from "./productCombination.schema";
import { variantTypesSchema } from "./variant.schema";
import z from "zod";

export const productBaseSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
  baseUnit: z.string(),
  categoryId: z.number(),
  products_name_unit: z.string().optional(),
});

export const productSchema = productBaseSchema.extend({
  id: z.number(),
  variants: z.array(variantTypesSchema).nullish(),
  sku: z.string(),
});

export const productSchemaWithCombinations = productSchema.extend({
  combinations: z.array(z.lazy(() => productCombinationsSchema)),
});

export type Product = z.infer<typeof productSchema>;
export type ProductWithCombinations = z.infer<
  typeof productSchemaWithCombinations
>;
export type ProductInput = z.infer<typeof productBaseSchema>;
