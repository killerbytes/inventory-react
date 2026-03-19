import { invoiceBaseSchema } from "./invoice.schema";
import { paymentSchema } from "./payment.schema";
import z from "zod";

export const paymentApplicationBaseSchema = z.object({
  invoiceId: z.number(),
  amountApplied: z.coerce.number().nullish(),
});

export const paymentApplicationSchema = paymentApplicationBaseSchema.extend({
  id: z.number().optional(),
  amountRemaining: z.coerce.number().nullish(),
  invoice: z.lazy(() => invoiceBaseSchema),
  paymentId: z.number(),
  payment: z.lazy(() => paymentSchema),
});

export type PaymentApplication = z.infer<typeof paymentApplicationSchema>;
