import { paymentBaseSchema } from "./payment.schema";
import { invoiceBaseSchema } from "./invoice.schema";
import z from "zod";

export const paymentApplicationSchema = z.object({
  id: z.number().optional(),
  invoiceId: z.number(),
  amountApplied: z.coerce.number().nullish(),
  amountRemaining: z.coerce.number().nullish(),
  invoice: z.lazy(() => invoiceBaseSchema),
  paymentId: z.number(),
  payment: z.lazy(() => paymentBaseSchema),
});

export type PaymentApplication = z.infer<typeof paymentApplicationSchema>;
