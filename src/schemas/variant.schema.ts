import z from "zod";

export const variantValuesSchema = z.object({
  id: z.number().nullish(),
  value: z.string().min(1, { message: "Value is required." }),
  variantTypeId: z.number().nullish(),
});
export const variantTypesSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name is required." }),
  productId: z.number().nullish(),
  isTemplate: z.boolean().nullish(),
  isBreakpackFilter: z.boolean().nullish(),
  values: z
    .array(variantValuesSchema)
    .min(1, { message: "At least one value" }),
});

export type VariantTypes = z.infer<typeof variantTypesSchema>;
export type VariantValues = z.infer<typeof variantValuesSchema>;
