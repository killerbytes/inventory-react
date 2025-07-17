import { MODE_OF_PAYMENT, ORDER_TYPE, UNIT } from "./utils/definitions";
import * as z from "zod";
import path from "path";

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

// export const loginSchema = z
//   .object({
//     password: z.string().min(1, "Password is required"),
//     confirmPassword: z.string().optional().nullable(),
//   })
//   .superRefine((data, ctx) => {
//     if (data.password && !data.confirmPassword) {
//       ctx.addIssue({
//         path: ["confirmPassword"],
//         code: z.ZodIssueCode.custom,
//         message: "Check number is required when payment is by check",
//       });
//     }
//   });

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
  id: z.number().optional(),
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
  unit: z.enum(Object.values(UNIT) as [string, ...string[]]),
  unitPrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().optional().nullable(),
  discountNote: z.string().optional().nullable(),
  inventory: z.any(),
});

export const cancelPurchaseOrderSchema = z.object({
  cancellationReason: z.string().min(2, {
    message: "Reason must be at least 2 characters.",
  }),
});

export const purchaseOrderSchema = z
  .object({
    id: z.number().optional(),
    purchaseOrderNumber: z
      .string({
        required_error: "PO number is required",
      })
      .min(2, { message: "PO number is required" }),
    supplierId: z.coerce
      .number({
        required_error: "Supplier is required",
        invalid_type_error: "Supplier is required",
      })
      .min(1, { message: "Supplier is required." }),
    internalNotes: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    purchaseOrderItems: z.array(purchaseOrderItemSchema).min(1, {
      message: "At least one product is required.",
    }),
    status: z.string().optional(),
    orderBy: z.number().optional(),
    orderDate: z.string(),
    deliveryDate: z.string(),
    receivedBy: z.number().optional().nullable(),
    receivedDate: z.date().optional().nullable(),
    completedBy: z.number().optional().nullable(),
    cancelledBy: z.number().optional().nullable(),
    completedDate: z.date().optional().nullable(),
    cancelledDate: z.date().optional().nullable(),
    totalAmount: z.string().optional(),
    supplier: z.any(),
    orderByUser: z.any(),
    receivedByUser: z.any(),
    completedByUser: z.any(),
    cancelledByUser: z.any(),
    dueDate: z.string().optional(),
    cancellationReason: z.string().optional().nullable(),
    modeOfPayment: z.enum(
      Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
    ),
    checkNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modeOfPayment === MODE_OF_PAYMENT.CHECK && !data.checkNumber) {
      ctx.addIssue({
        path: ["checkNumber"],
        code: z.ZodIssueCode.custom,
        message: "Check number is required when payment is by check",
      });
      ctx.addIssue({
        path: ["dueDate"],
        code: z.ZodIssueCode.custom,
        message: "Due date is required when payment is by check",
      });
    }
  });

export const salesOrderItemSchema = z
  .object({
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
    inventory: z.any(),
  })
  .refine(
    (data) => {
      return data.quantity <= data.inventory.quantity;
    },
    {
      message: "Stock quantity is less than the requested quantity.",
      path: ["quantity"],
    },
  );

export const salesOrderSchema = z.object({
  id: z.number().optional().nullable(),
  customer: z.string().min(2, {
    message: "Customer must be at least 2 characters.",
  }),
  orderDate: z.date({
    required_error: "Order Date is required",
  }),
  deliveryDate: z.date({
    required_error: "Delivery Date is required",
  }),
  notes: z.string().optional().nullable(),
  salesOrderItems: z.array(salesOrderItemSchema).min(1, {
    message: "At least one item must be added.",
  }),
  status: z.string().optional().nullable(),
  receivedDate: z.date().optional(),
  totalAmount: z.coerce.number().optional().nullable(),
  orderBy: z.number().optional().nullable(),
  receivedBy: z.number().optional().nullable(),
  supplier: z.any(),
  orderByUser: z.any(),
  receivedByUser: z.any(),
});

export const inventorySchema = z.object({
  id: z.number().optional().nullable(),
  productId: z.number().min(1, {
    message: "Product must be selected.",
  }),
  product: z.any(),
  quantity: z.coerce.number().optional().nullable(),
  price: z.coerce.number().min(1, {
    message: "Price must be at least 1.",
  }),
  updatedAt: z.date(),
});

export const inventoryTransactionSchema = z.object({
  id: z.number().optional().nullable(),
  inventoryId: z.number().min(1, {
    message: "Inventory must be selected.",
  }),
  inventory: z.any(),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  previousQuantity: z.coerce.number().min(1, {
    message: "Previous Quantity must be at least 1.",
  }),
  newQuantity: z.coerce.number().min(1, {
    message: "New Quantity must be at least 1.",
  }),
  orderType: z.enum(Object.values(ORDER_TYPE) as [string, ...string[]]),
  transactionType: z.string().min(2, {
    message: "Transaction Type must be at least 2 characters.",
  }),
  updatedAt: z.date(),
  orderId: z.number().min(1, {
    message: "Order must be selected.",
  }),
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
  inventoryTransactionSchema,
};
