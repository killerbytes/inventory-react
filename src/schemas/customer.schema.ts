import { supplierSchema } from "./supplier.schema";
import z from "zod";

export const customerSchema = supplierSchema;

export type Customer = z.infer<typeof customerSchema>;
