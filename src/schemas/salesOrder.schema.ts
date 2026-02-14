import { productCombinationBaseSchema } from "./productCombination.schema";
import { MODE_OF_PAYMENT, ORDER_STATUS } from "../utils/definitions";
import { returnTransactionBaseSchema } from "./returnItem.schema";
import { statusHistorySchema } from "./others";
import * as z from "zod";

export const salesOrderItemBaseSchema = z.object({
  combinationId: z.coerce.number().min(1, {
    message: "Product must be selected.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  purchasePrice: z.coerce.number().min(0.01, {
    message: "Price must be at least 0.01.",
  }),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
  combinations: productCombinationBaseSchema.nullish(),
});

export const salesOrderItemSchema = salesOrderItemBaseSchema.extend({
  id: z.coerce.number().optional(),

  originalPrice: z.coerce.number().nullish(),
  totalAmount: z.coerce.number().nullish(),
  variantSnapshot: z.any().nullish(),
  skuSnapshot: z.string().nullish(),
  nameSnapshot: z.string().nullish(),
  unit: z.string().nullish(),
});

const salesOrderBaseSchema = z.object({
  id: z.number().optional(),
  status: z.string(),
  salesOrderNumber: z.string().nullish(),
  customerId: z.coerce.number().min(1, {
    message: "Customer is required.",
  }),
  orderDate: z.string(),
  isDelivery: z.boolean().optional(),
  isDeliveryCompleted: z.boolean().nullish(),
  deliveryAddress: z.string().nullish(),
  deliveryInstructions: z.string().nullish(),
  deliveryDate: z.string().nullish(),
  internalNotes: z.string().nullish(),
  notes: z.string().nullish(),
  dueDate: z.string().nullish(),
  modeOfPayment: z.enum(
    Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
  ),
  checkNumber: z.string().nullish(),

  salesOrderItems: z.array(salesOrderItemBaseSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const salesOrderFormSchema = salesOrderBaseSchema.superRefine(
  (data, ctx) => {
    if (data.isDelivery && !data.deliveryDate) {
      ctx.addIssue({
        path: ["deliveryDate"],
        code: z.ZodIssueCode.custom,
        message: "Delivery date is required when delivery is selected",
      });
    }
    if (data.isDelivery && !data.deliveryAddress) {
      ctx.addIssue({
        path: ["deliveryAddress"],
        code: z.ZodIssueCode.custom,
        message: "Delivery address is required when delivery is selected",
      });
    }
  },
);

export const salesOrderSchema = salesOrderBaseSchema
  .extend({
    totalAmount: z.string().optional(),
    customer: z.any(),
    cancellationReason: z.string().nullish(),
    returnTransactions: z.array(returnTransactionBaseSchema),
    totalReturnAmount: z.string().optional(),
    totalExchangeAmount: z.string().optional(),
    salesOrderStatusHistory: z.array(statusHistorySchema),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === ORDER_STATUS.DRAFT &&
      data.salesOrderItems?.length === 0
    ) {
      ctx.addIssue({
        path: ["salesOrderItems"],
        code: z.ZodIssueCode.custom,
        message: "Sales Order Items are required",
      });
    }
    if (data.modeOfPayment === MODE_OF_PAYMENT.CHECK && !data.checkNumber) {
      ctx.addIssue({
        path: ["checkNumber"],
        code: z.ZodIssueCode.custom,
        message: "Check number is required when payment is by check",
      });
    }
  });

export type SalesOrder = z.infer<typeof salesOrderSchema>;
export type SalesOrderForm = z.infer<typeof salesOrderFormSchema>;
export type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
