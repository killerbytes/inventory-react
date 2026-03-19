import { supplierSchema } from "../features/suppliers/schemas/supplier.schema";
import z from "zod";

export const customerSchema = supplierSchema;
export const customerInputSchema = supplierSchema.omit({ id: true });

export type Customer = z.infer<typeof customerSchema>;
export type CustomerInput = z.infer<typeof customerInputSchema>;
