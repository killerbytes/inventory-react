import {
  goodReceiptSchema,
  invoiceGoodReceiptSchema,
} from "./goodReceipt.schema";
import { paymentApplicationSchema } from "./paymentApplication.schema";
import { supplierSchema } from "./supplier.schema";
import { paymentSchema } from "./payment.schema";
import z from "zod";

export const invoiceBaseSchema = z.object({
  supplierId: z.number(),
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
  notes: z.string().nullish(),
});

export const invoiceSchema = invoiceBaseSchema.extend({
  id: z.number().optional(),
  changedBy: z.string(),
  supplier: z.lazy(() => supplierSchema).nullish(),
  payment: z.lazy(() => paymentSchema).nullish(),
  totalAmount: z.coerce.number().nullish(),
  invoiceLines: z.array(z.lazy(() => invoiceLineSchema)),
  applications: z.array(z.lazy(() => paymentApplicationSchema)),
});

export const invoiceLineSchema = z.object({
  amount: z.number(),
  goodReceiptId: z.number(),
  goodReceipt: goodReceiptSchema.nullish(),
});

export const invoiceFormSchema = z.object({
  id: z.number().optional(),
  supplierId: z.number().min(1, { message: "Supplier is required." }),
  invoiceNumber: z.string().min(1, { message: "Invoice Number is required." }),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
  notes: z.string().nullish(),
  gr: z.array(invoiceGoodReceiptSchema).min(1, {
    message: "At least one Good Receipt is required.",
  }),
});
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceCreate = z.infer<typeof invoiceBaseSchema>;
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type invoiceForm = z.infer<typeof invoiceFormSchema>;
export type InvoiceGoodReceipt = z.infer<typeof invoiceGoodReceiptSchema>;
