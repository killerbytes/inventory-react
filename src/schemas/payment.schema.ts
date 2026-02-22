import { paymentApplicationSchema } from "./paymentApplication.schema";
import { supplierSchema } from "./supplier.schema";
import z from "zod";

export const paymentBaseSchema = z.object({
  id: z.number().optional(),
  supplierId: z.number(),
  supplier: z.lazy(() => supplierSchema).nullish(),
  referenceNo: z.string().nullish(),
  paymentDate: z.string(),
  amount: z.coerce.number().nullish(),
  notes: z.string().nullish(),
  changedBy: z.number().nullish(),
});

export const paymentSchema = paymentBaseSchema.extend({
  applications: z
    .array(z.lazy(() => paymentApplicationSchema).nullish())
    .min(1, {
      message: "At least one product is required.",
    }),
});

export type PaymentInput = z.infer<typeof paymentBaseSchema>;
export type Payment = z.infer<typeof paymentSchema>;
