import { productCombinationSchema } from "@/schemas";
import z from "zod";

export const reorderSchema = z.object({
  combinationId: z.number(),
  combinations: productCombinationSchema,
  id: z.number(),
  lastSoldAt: z.string(),
  quantity: z.coerce.number(),
});

export const popularSchema = z.object({
  name: z.string(),
  combinations: productCombinationSchema,
  lastSoldAt: z.string(),
  quantity: z.coerce.number(),
});

export const profitSchema = z.object({
  name: z.string(),
  combinations: productCombinationSchema,
  totalProfit: z.coerce.number(),
  totalQuantity: z.coerce.number(),
  nameSnapshot: z.string(),
  unit: z.string(),
});

export const noSalesSchema = z.object({
  name: z.string(),
  productId: z.string(),
  unit: z.string(),
  inventory: z.object({
    quantity: z.number(),
  }),
});

export type Reorder = z.infer<typeof reorderSchema>;

export type Popular = z.infer<typeof popularSchema>;

export type Profit = z.infer<typeof profitSchema>;

export type NoSales = z.infer<typeof noSalesSchema>;
