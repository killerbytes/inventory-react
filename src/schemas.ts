import { ORDER_TYPE } from "./utils/definitions";
import { ca } from "date-fns/locale";
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
  unitPrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().optional().nullable(),
  inventory: z.any(),
});

export const cancelPurchaseOrderSchema = z.object({
  cancellationReason: z.string().min(2, {
    message: "Reason must be at least 2 characters.",
  }),
});

export const purchaseOrderSchema = z
  .object({
    id: z.number().optional().nullable(),
    supplierId: z.coerce
      .number()
      .min(1, { message: "Supplier must be selected." }),
    notes: z.string().optional().nullable(),
    purchaseOrderItems: z.array(purchaseOrderItemSchema).min(1, {
      message: "At least one item must be added.",
    }),
    status: z.string().optional().nullable(),
    orderBy: z.number().optional().nullable(),
    orderDate: z.coerce.string().min(2, {
      message: "Order Date must be at least 2 characters.",
    }),
    deliveryDate: z.coerce.string().min(2, {
      message: "Delivery Date must be at least 2 characters.",
    }),
    receivedBy: z.number().optional().nullable(),
    receivedDate: z.coerce.string().optional().nullable(),
    completedBy: z.number().optional().nullable(),
    cancelledBy: z.number().optional().nullable(),
    completedDate: z.coerce.string().optional().nullable(),
    cancelledDate: z.coerce.string().optional().nullable(),
    totalAmount: z.string().optional(),
    supplier: z.any(),
    orderByUser: z.any(),
    receivedByUser: z.any(),
    completedByUser: z.any(),
    cancelledByUser: z.any(),
    isCheckPayment: z.boolean().optional().nullable(),
    isCheckPaymentPaid: z.boolean().optional().nullable(),
    dueDate: z.coerce.string().optional().nullable(),
    cancellationReason: z.string().optional().nullable(),
  })
  .refine((data) => !data.isCheckPayment || data.dueDate, {
    message: "Due date is required when payment is by check",
    path: ["dueDate"], // This connects the error to the dueDate field
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
  inventory: z.any(),
});

export const salesOrderSchema = z.object({
  id: z.number().optional().nullable(),
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
  salesOrderItems: z.array(salesOrderItemSchema).min(1, {
    message: "At least one item must be added.",
  }),
  status: z.string().optional().nullable(),
  receivedDate: z.string().optional().nullable(),
  totalAmount: z.coerce.number().optional().nullable(),
  orderBy: z.number().optional().nullable(),
  receivedBy: z.number().optional().nullable(),
  supplier: z.any(),
  orderByUser: z.any(),
  receivedByUser: z.any(),
});

export const inventorySchema = z
  .object({
    id: z.number().optional().nullable(),
    productId: z.number().min(1, {
      message: "Product must be selected.",
    }),
    product: z.any(),
    quantity: z.coerce.number().min(1, {
      message: "Quantity must be at least 1.",
    }),
    price: z.coerce.number().min(1, {
      message: "Price must be at least 1.",
    }),
    updatedAt: z.coerce.string().min(2, {
      message: "Updated At must be at least 2 characters.",
    }),
  })
  .refine(
    (data) => {
      console.log(data);

      return data.quantity > 0;
    },
    {
      message: "Quantity must be greater than 0.",
      path: ["quantity"],
    },
  );

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
  updatedAt: z.coerce.string().min(2, {
    message: "Updated At must be at least 2 characters.",
  }),
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
