import {
  productCombinationBaseSchema,
  productCombinationsSchema,
} from "./productCombination.schema";
import z from "zod";

export const returnItemBaseSchema = z.object({
  combinationId: z.number(),
  combination: productCombinationsSchema.nullish(),
  returnQuantity: z.coerce.number(),
  purchasePrice: z.coerce.number(),
  discount: z.coerce.number(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number().optional(),
  totalAmount: z.coerce.number(),
  unit: z.string(),
  type: z.string().optional(),
});

export const returnTransactionBaseSchema = z.object({
  id: z.number().optional(),
  totalReturnAmount: z.coerce.number(),
  totalExchangeAmount: z.coerce.number(),
  sourceType: z.string(),
  updatedAt: z.string(),
  returnItems: z.array(returnItemBaseSchema),
});

export const exchangeItemBaseSchema = returnItemBaseSchema.omit({
  returnQuantity: true,
  totalAmount: true,
  unit: true,
});

export const returnBaseSchema = z.object({
  returns: z.array(returnItemBaseSchema),
  exchanges: z.array(exchangeItemBaseSchema).optional(),
  reason: z.string(),
});

export const returnItemFormSchema = returnItemBaseSchema.extend({
  combination: productCombinationBaseSchema.nullish(),
});
export const exchangeItemFormSchema = exchangeItemBaseSchema.extend({
  combination: productCombinationBaseSchema.nullish(),
});
export const returnFormSchema = returnBaseSchema.extend({
  returns: z.array(returnItemFormSchema),
  exchanges: z.array(exchangeItemFormSchema).optional(),
});

export type ReturnItemInput = z.infer<typeof returnItemBaseSchema>;
export type ExchangeItemInput = z.infer<typeof exchangeItemBaseSchema>;

export type ReturnItemForm = z.infer<typeof returnItemFormSchema>;
export type ExchangeItemForm = z.infer<typeof exchangeItemFormSchema>;

export type ReturnTransactionInput = z.infer<
  typeof returnTransactionBaseSchema
>;
export type ReturnInput = z.infer<typeof returnBaseSchema>;

export type ReturnItem = Omit<ReturnItemInput, "combination"> & {
  combinationSnapshot: ReturnItemInput["combination"];
};
export type ExchangeItem = Omit<ExchangeItemInput, "combination"> & {
  combinationSnapshot: ExchangeItemInput["combination"];
};
export type ReturnTransaction = Omit<ReturnTransactionInput, "returnItems"> & {
  returnItems: ReturnItem[];
};
// export type Return = {
//   returns: ReturnItem[];
//   exchanges: ExchangeItem[];
//   reason: string;
// };

export type ReturnForm = z.infer<typeof returnFormSchema>;

export function mapReturnItemToDomain(input: ReturnItemInput): ReturnItem {
  const { combination, ...rest } = input;

  return {
    ...rest,
    combinationSnapshot: combination,
  };
}
export function mapExchangeItemToDomain(
  input: ExchangeItemInput,
): ExchangeItem {
  const { combination, ...rest } = input;

  return {
    ...rest,
    combinationSnapshot: combination,
  };
}
export function mapReturnTransactionToDomain(
  input: ReturnTransactionInput,
): ReturnTransaction {
  return {
    ...input,
    returnItems: input.returnItems.map(mapReturnItemToDomain),
  };
}

export function mapReturnToDomain(input: ReturnInput): ReturnInput {
  return {
    reason: input.reason,
    returns: input.returns.map(mapReturnItemToDomain),
    exchanges: input.exchanges?.map(mapExchangeItemToDomain) || [],
  };
}
