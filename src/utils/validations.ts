import * as z from "zod";

const userSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  isActive: z.boolean().optional(),
  password: z.string(),
  // .min(8, {
  //   message: "Password must be at least 8 characters.",
  // })
  // .regex(/[a-z]/, {
  //   message: "Password must contain at least one lowercase letter.",
  // })
  // .regex(/[A-Z]/, {
  //   message: "Password must contain at least one uppercase letter.",
  // })
  // .regex(/[0-9]/, {
  //   message: "Password must contain at least one number.",
  // })
  // .regex(/[^a-zA-Z0-9]/, {
  //   message: "Password must contain at least one special character.",
  // }),
  confirmPassword: z.string(),
});

const loginSchema = userSchema.pick({
  username: true,
  password: true,
});

const categorySchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
});

const productSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  categoryId: z.number().min(1, {
    message: "Category must be selected.",
  }),
  description: z.string().optional().nullable(),
  reorderLevel: z.coerce.number().optional(),
});

const supplierSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  contact: z
    .string()
    .min(2, {
      message: "Contact must be at least 2 characters.",
    })
    .optional()
    .nullable(),
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

const purchaseOrderSchema = z.object({
  supplierId: z.number().min(1, {
    message: "Supplier must be selected.",
  }),
  orderDate: z.coerce.string().min(2, {
    message: "Order Date must be at least 2 characters.",
  }),
  status: z
    .string()
    .min(2, {
      message: "Order Status must be at least 2 characters.",
    })
    .optional(),
  deliverDate: z.coerce.string().min(2, {
    message: "Delivery Date must be at least 2 characters.",
  }),
  receivedDate: z.coerce.string().min(2, {
    message: "Received Date must be at least 2 characters.",
  }),
  totalAmount: z.coerce.number().min(1, {
    message: "Total Amount must be at least 1.",
  }),
  // orderBy: z.number().min(1, {
  //   message: "Order By must be at least 1.",
  // }),
  // receivedBy: z.number().min(1, {
  //   message: "Received By must be at least 1.",
  // }),
  notes: z.string().optional().nullable(),
});

export default {
  categorySchema,
  userSchema,
  loginSchema,
  productSchema,
  supplierSchema,
  purchaseOrderSchema,
};
