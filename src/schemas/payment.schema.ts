import { supplierSchema } from "../features/suppliers/schemas/supplier.schema";
import { paymentApplicationBaseSchema } from "./paymentApplication.schema";
import z from "zod";

export const paymentBaseSchema = z.object({
  supplierId: z.number(),
  referenceNo: z.string().nullish(),
  paymentDate: z.string(),
  amount: z.coerce.number().nullish(),
  notes: z.string().nullish(),
});

export const paymentInputSchema = paymentBaseSchema.extend({
  applications: z
    .array(z.lazy(() => paymentApplicationBaseSchema).nullish())
    .min(1, {
      message: "At least one product is required.",
    }),
});

export const paymentSchema = paymentInputSchema.extend({
  id: z.number().optional(),
  supplier: z.lazy(() => supplierSchema).nullish(),
  changedBy: z.number().nullish(),
});

export type PaymentInput = z.infer<typeof paymentInputSchema>;
export type Payment = z.infer<typeof paymentSchema>;
