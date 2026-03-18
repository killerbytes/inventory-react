import z from "zod";

export const supplierBaseSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  contact: z.string().optional().nullable(),
  phone: z.string().min(2, {
    message: "Phone must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional()
    .nullable(),
});

export const supplierSchema = supplierBaseSchema.extend({
  id: z.number(),
});

export type SupplierInput = z.infer<typeof supplierBaseSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
