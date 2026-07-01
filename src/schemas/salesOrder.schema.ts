import { productCombinationSearchSchema } from "./productCombination.schema";
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
  combinations: productCombinationSearchSchema.nullish(),
});

export const salesOrderItemSchema = salesOrderItemBaseSchema.extend({
  id: z.number(),
  originalPrice: z.coerce.number(),
  totalAmount: z.coerce.number(),
  variantSnapshot: z.any(),
  skuSnapshot: z.string(),
  nameSnapshot: z.string(),
  unit: z.string().nullish(),
});

export const salesOrderBaseSchema = z.object({
  salesOrderNumber: z.string().min(2, "Receipt number is required"),
  customerId: z.coerce.number().min(1, {
    message: "Customer is required.",
  }),
  orderDate: z.string(),
  status: z.string(),
  modeOfPayment: z.enum(
    Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
  ),
  isDelivery: z.boolean().optional(),
  deliveryAddress: z.string().nullish(),
  deliveryInstructions: z.string().nullish(),
  deliveryDate: z.string().nullish(),
  internalNotes: z.string().nullish(),
  notes: z.string().nullish(),
  dueDate: z.string().nullish(),
  checkNumber: z.string().nullish(),
  salesOrderItems: z.array(salesOrderItemBaseSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const salesOrderFormSchema = salesOrderBaseSchema
  .extend({
    salesOrderItems: z.array(salesOrderItemBaseSchema),
  })
  .superRefine((data, ctx) => {
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
  });

export const salesOrderSchema = salesOrderBaseSchema
  .extend({
    id: z.number(),
    salesOrderNumber: z.string(),
    isDeliveryCompleted: z.boolean().nullish(),
    totalAmount: z.string(),
    customer: z.any(),
    cancellationReason: z.string().nullish(),
    returnTransactions: z.array(returnTransactionBaseSchema),
    totalReturnAmount: z.string(),
    totalExchangeAmount: z.string(),
    salesOrderStatusHistory: z.array(statusHistorySchema),
    salesOrderItems: z.array(salesOrderItemSchema).min(1, {
      message: "At least one product is required.",
    }),
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

export const articlesSchema = z.object({
  article: z.string(),
  value: z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    unit: z.string(),
  }),
  quantity: z.number().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number(),
  amount: z.number().nullish(),
  suggestedProducts: z.array(z.any()),
});

export const ocrFormSchema = z.object({
  receiptNo: z.string().min(1, "Receipt number is required"),
  articles: z.array(articlesSchema),
});

export type SalesOrderInput = z.infer<typeof salesOrderBaseSchema>;
export type SalesOrder = z.infer<typeof salesOrderSchema>;
export type SalesOrderForm = z.infer<typeof salesOrderFormSchema>;
export type SalesOrderItemBase = z.infer<typeof salesOrderItemBaseSchema>;
export type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
export type OCRForm = z.infer<typeof ocrFormSchema>;
export type Articles = z.infer<typeof articlesSchema>;
