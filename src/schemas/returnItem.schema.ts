import { productCombinationBaseSchema } from "./productCombination.schema";
import z from "zod";

export const returnItemSchema = z.object({
  combinationId: z.number(),
  combination: productCombinationBaseSchema.nullish(),
  returnQuantity: z.coerce.number(),
  purchasePrice: z.coerce.number(),
  discount: z.coerce.number(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number().optional(),
  totalAmount: z.coerce.number(),
  unit: z.string(),
  type: z.string().optional(),
});

export const returnTransactionSchema = z.object({
  id: z.number().optional(),
  totalReturnAmount: z.coerce.number(),
  totalExchangeAmount: z.coerce.number(),
  sourceType: z.string(),
  updatedAt: z.string(),
  returnItems: z.array(returnItemSchema),
});

export const exchangeItemSchema = returnItemSchema.omit({
  returnQuantity: true,
  totalAmount: true,
  unit: true,
});

export const returnSchema = z.object({
  returns: z.array(returnItemSchema),
  exchanges: z.array(exchangeItemSchema).optional(),
  reason: z.string(),
});

export type ReturnItem = z.infer<typeof returnItemSchema>;
export type ReturnTransaction = z.infer<typeof returnTransactionSchema>;
export type ExchangeItem = z.infer<typeof exchangeItemSchema>;
export type Return = z.infer<typeof returnSchema>;
