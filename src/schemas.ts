import * as z from "zod";

export const userSchema = z.object({
  id: z.number().optional(),
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
});

export const signupSchema = userSchema
  .extend({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .omit({
    id: true,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const categorySchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
});

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  categoryId: z.number().min(1, {
    message: "Category must be selected.",
  }),
  category: z.any(),
  description: z.string().optional().nullable(),
  reorderLevel: z.coerce.number().optional(),
});

export const supplierSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  contact: z.string().optional(),
  phone: z.string().min(2, {
    message: "Phone must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
});

export const purchaseOrderItemSchema = z.object({
  productId: z.coerce.number().min(1, {
    message: "Product must be selected.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  unitPrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().optional().nullable(),
  product: z.any(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.coerce
    .number()
    .min(1, { message: "Supplier must be selected." }),
  orderDate: z.string().min(2, {
    message: "Order Date must be at least 2 characters.",
  }),
  deliveryDate: z.string().min(2, {
    message: "Delivery Date must be at least 2 characters.",
  }),
  notes: z.string().optional().nullable(),
  purchaseOrderItems: z.array(purchaseOrderItemSchema).min(1, {
    message: "At least one item must be added.",
  }),
  status: z.string().optional().nullable(),
  receivedDate: z.string().optional().nullable(),
  totalAmount: z.number().optional().nullable(),
  orderBy: z.number().optional().nullable(),
  receivedBy: z.number().optional().nullable(),
});

export const salesOrderItemSchema = z.object({
  inventoryId: z.number().min(1, {
    message: "Product must be selected.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  unitPrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().optional().nullable(),
});

export const salesOrderSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer must be at least 2 characters.",
  }),
  orderDate: z.coerce.string().min(2, {
    message: "Order Date must be at least 2 characters.",
  }),
  deliveryDate: z.coerce.string().min(2, {
    message: "Delivery Date must be at least 2 characters.",
  }),
  notes: z.string().optional().nullable(),
  salesOrderItemSchema: z.array(salesOrderItemSchema).min(1, {
    message: "At least one item must be added.",
  }),
});

export const inventorySchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  reorderLevel: z.coerce.number().optional(),
});

export const inventoryItemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  reorderLevel: z.coerce.number().optional(),
});

export default {
  userSchema,
  signupSchema,
  loginSchema,
  categorySchema,
  productSchema,
  supplierSchema,
  purchaseOrderSchema,
  purchaseOrderItemSchema,
  salesOrderSchema,
  salesOrderItemSchema,
  inventorySchema,
  inventoryItemSchema,
};
