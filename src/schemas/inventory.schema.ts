import z from "zod";

export const inventorySchema = z.object({
  id: z.number(),
  product: z.any(),
  quantity: z.coerce.number(),
  parentId: z.number().nullish(),
  updatedAt: z.string().nullish(),
  averagePrice: z.coerce.number().nullish(),
});

export type Inventory = z.infer<typeof inventorySchema>;
