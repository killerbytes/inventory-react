import { productCombinationsSchema } from "./productCombination.schema";
import { variantTypesSchema } from "./variant.schema";
import z from "zod";

export const productBaseSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
  sku: z.string().nullish(),
  baseUnit: z.string(),
  categoryId: z.number(),
  variants: z.array(variantTypesSchema).nullish(),
  products_name_unit: z.string().nullish(),
});

export const productSchema = productBaseSchema.extend({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
  categoryId: z.number(),
  variants: z.array(variantTypesSchema).nullish(),
  combinations: z.array(z.lazy(() => productCombinationsSchema)).nullish(),
  products_name_unit: z.string().nullish(),
});

export type Product = z.infer<typeof productSchema>;
