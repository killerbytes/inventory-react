import { productCombinationsSchema } from "./productCombination.schema";
import * as z from "zod";

export const breakPackSchema = z.object({
  fromCombinationId: z.number(),
  fromCombination: productCombinationsSchema,
  toCombinationId: z.number(),
  toCombination: productCombinationsSchema,
  quantity: z.number().refine((val) => !isNaN(val), {
    message: "Number must not be NaN",
  }),
  user: z.any(),
  createdAt: z.string().nullish(),
});
export type BreakPack = z.infer<typeof breakPackSchema>;
