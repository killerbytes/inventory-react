import { productCombinationSchema } from "./productCombination.schema";
import z from "zod";

export const inventoryMovementSchema = z.object({
  id: z.number().optional(),
  // inventoryId: z.number(),
  // inventory: z.any(),
  combination: productCombinationSchema,
  quantity: z.number(),
  costPerUnit: z.number(),
  totalCost: z.number(),
  referenceId: z.string().nullish(),
  referenceType: z.string().nullish(),
  type: z.string(),
  reason: z.string(),
  referenceDate: z.date(),
  updatedAt: z.date(),
  reference: z.number(),
});
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;
