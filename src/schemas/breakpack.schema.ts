import { productCombinationSchema } from "./productCombination.schema";
import * as z from "zod";

export const breakPackBaseSchema = z.object({
  fromCombinationId: z.number(),
  toCombinationId: z.number(),
  quantity: z.number().refine((val) => !isNaN(val), {
    message: "Number must not be NaN",
  }),
});

export const breakPackSchema = breakPackBaseSchema.extend({
  fromCombination: productCombinationSchema,
  toCombination: productCombinationSchema,
  user: z.any(),
  createdAt: z.string().nullish(),
});

export type BreakPackInput = z.infer<typeof breakPackBaseSchema>;
export type BreakPack = z.infer<typeof breakPackSchema>;
