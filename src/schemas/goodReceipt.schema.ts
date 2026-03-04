import { productCombinationsFormSchema } from "./productCombination.schema";
import { returnTransactionBaseSchema } from "./returnItem.schema";
import { ORDER_STATUS } from "@/utils/definitions";
import { statusHistorySchema } from "./others";
import z from "zod";

export const goodReceiptLineBaseSchema = z.object({
  combinationId: z.number().min(1, { message: "Product is required." }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  purchasePrice: z.coerce
    .number()
    .min(0.01, { message: "Price must be at least 0.01." })
    .superRefine((val, ctx) => {
      if (isNaN(val)) {
        ctx.addIssue({ code: "custom", message: "Amount is required" });
      } else {
        const decimalPlaces = (val.toString().split(".")[1] || "").length;
        if (decimalPlaces > 2) {
          ctx.addIssue({
            code: "custom",
            message: "Max 2 decimal places allowed",
          });
        }
      }
    })
    .pipe(z.number().min(0)),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
});

export const goodReceiptLineSchema = goodReceiptLineBaseSchema.extend({
  id: z.coerce.number(),
  totalAmount: z.coerce.number(),
  variantSnapshot: z.any(),
  skuSnapshot: z.string(),
  nameSnapshot: z.string(),
  unit: z.string(),
  combinations: productCombinationsFormSchema.nullish(),
});

export const goodReceiptLineFormSchema = goodReceiptLineBaseSchema.extend({
  combinations: productCombinationsFormSchema.nullish(),
});

export const goodReceiptBaseSchema = z.object({
  supplierId: z.coerce
    .number({
      required_error: "Supplier is required",
      invalid_type_error: "Supplier is required",
    })
    .min(1, { message: "Supplier is required." }),
  internalNotes: z.string().nullish(),
  referenceNo: z.string().min(1, { message: "Reference Number is required." }),
  receiptDate: z.string(),
  goodReceiptLines: z.array(goodReceiptLineBaseSchema).min(1, {
    message: "At least one product is required.",
  }),
  status: z.string().nullish(),
});

export const goodReceiptSchema = goodReceiptBaseSchema
  .extend({
    id: z.number(),
    status: z.string(),
    supplier: z.any(),
    cancellationReason: z.string().nullish(),
    totalAmount: z.string(),
    goodReceiptLines: z.array(goodReceiptLineSchema).min(1, {
      message: "At least one product is required.",
    }),
    goodReceiptStatusHistory: z.array(statusHistorySchema),
    returnTransactions: z.array(returnTransactionBaseSchema).nullish(),
    totalReturnAmount: z.coerce.number().nullish(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === ORDER_STATUS.DRAFT &&
      data.goodReceiptLines?.length === 0
    ) {
      ctx.addIssue({
        path: ["goodReceiptLines"],
        code: z.ZodIssueCode.custom,
        message: "Purchase Order Items are required",
      });
    }
  });

export const goodReceiptFormSchema = goodReceiptBaseSchema.extend({
  goodReceiptLines: z.array(goodReceiptLineFormSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const invoiceGoodReceiptSchema = goodReceiptBaseSchema.extend({
  id: z.number(),
  status: z.string(),
  supplier: z.any(),
  totalAmount: z.string(),
  totalReturnAmount: z.coerce.number().nullish(),
});

export const supplierHistorySchema = goodReceiptLineSchema.extend({
  goodReceipt: goodReceiptSchema,
  combinations: productCombinationsFormSchema,
});

export type GoodReceiptInput = z.infer<typeof goodReceiptBaseSchema>;
export type GoodReceipt = z.infer<typeof goodReceiptSchema>;
export type GoodReceiptForm = z.infer<typeof goodReceiptFormSchema>;
export type GoodReceiptItem = z.infer<typeof goodReceiptLineSchema>;
export type GoodReceiptItemInput = z.infer<typeof goodReceiptLineBaseSchema>;
export type SupplierHistory = z.infer<typeof supplierHistorySchema>;
export type InvoiceGoodReceipt = z.infer<typeof invoiceGoodReceiptSchema>;
