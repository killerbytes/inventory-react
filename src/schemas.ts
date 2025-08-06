import { MODE_OF_PAYMENT, ORDER_TYPE, UNIT } from "./utils/definitions";
import * as z from "zod";

const userSchema = z.object({
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

const signupSchema = userSchema
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

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

//  const loginSchema = z
//   .object({
//     password: z.string().min(1, "Password is required"),
//     confirmPassword: z.string().nullish(),
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

const categorySchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
});

const inventorySchema = z.object({
  id: z.number(),
  product: z.any(),
  quantity: z.coerce.number(),
  parentId: z.number().nullish(),
  updatedAt: z.string().nullish(),
});

const variantValuesSchema = z.object({
  id: z.number().nullish(),
  value: z.string().min(1, { message: "Value is required." }),
  variantTypeId: z.number().nullish(),
});

const productCombinationsSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  sku: z.string(),
  price: z.coerce.number(),
  reorderLevel: z.coerce.number(),
  Inventory: inventorySchema.nullish(),
  values: z.array(variantValuesSchema),
});

const variantTypesSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name is required." }),
  productId: z.number().nullish(),
  values: z
    .array(variantValuesSchema)
    .min(1, { message: "At least one value" }),
});

const productSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
  unit: z.string(),
  categoryId: z.number(),
  variants: z.array(variantTypesSchema),
  combinations: z.array(productCombinationsSchema),
});

const supplierSchema = z.object({
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

const purchaseOrderItemSchema = z.object({
  id: z.coerce.number().nullish(),
  productId: z.coerce
    .number()
    .min(1, {
      message: "Product must be selected.",
    })
    .nullable(),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  unit: z.enum(Object.values(UNIT) as [string, ...string[]]),
  unitPrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
  amount: z.coerce.number().nullish(),
});

const cancelPurchaseOrderSchema = z.object({
  cancellationReason: z.string().min(2, {
    message: "Reason must be at least 2 characters.",
  }),
});

const purchaseOrderSchema = z
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
    internalNotes: z.string().nullish(),
    notes: z.string().nullish(),
    purchaseOrderItems: z.array(purchaseOrderItemSchema).min(1, {
      message: "At least one product is required.",
    }),
    status: z.string().optional(),
    orderBy: z.number().optional(),
    orderDate: z.string(),
    deliveryDate: z.string(),
    receivedBy: z.number().nullish(),
    receivedDate: z.string().nullish(),
    completedBy: z.number().nullish(),
    cancelledBy: z.number().nullish(),
    completedDate: z.string().nullish(),
    cancelledDate: z.string().nullish(),
    totalAmount: z.string().optional(),
    supplier: z.any(),
    orderByUser: z.any(),
    receivedByUser: z.any(),
    completedByUser: z.any(),
    cancelledByUser: z.any(),
    dueDate: z.string().nullish(),
    cancellationReason: z.string().nullish(),
    modeOfPayment: z.enum(
      Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
    ),
    checkNumber: z.string(),
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

const salesOrderItemSchema = z
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
    discount: z.coerce.number().nullish(),
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

const salesOrderSchema = z.object({
  id: z.number().nullish(),
  customer: z.string().min(2, {
    message: "Customer must be at least 2 characters.",
  }),
  orderDate: z.date({
    required_error: "Order Date is required",
  }),
  deliveryDate: z.date({
    required_error: "Delivery Date is required",
  }),
  notes: z.string().nullish(),
  salesOrderItems: z.array(salesOrderItemSchema).min(1, {
    message: "At least one item must be added.",
  }),
  status: z.string().nullish(),
  receivedDate: z.date().optional(),
  totalAmount: z.coerce.number().nullish(),
  orderBy: z.number().nullish(),
  receivedBy: z.number().nullish(),
  supplier: z.any(),
  orderByUser: z.any(),
  receivedByUser: z.any(),
});

const inventoryTransactionSchema = z.object({
  id: z.number().nullish(),
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

const repackageInventorySchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  categoryId: z.number(),
  unit: z.string(),
  price: z.coerce.number().min(1, {
    message: "Price must be at least 1.",
  }),
  pullOutQuantity: z.coerce.number().min(1, {
    message: "Pull-out Quantity must be at least 1.",
  }),
  repackQuantity: z.coerce.number().min(1, {
    message: "Repack Quantity must be at least 1.",
  }),
  parentId: z.number(),
});

export {
  userSchema,
  signupSchema,
  loginSchema,
  cancelPurchaseOrderSchema,
  categorySchema,
  productSchema,
  supplierSchema,
  purchaseOrderSchema,
  purchaseOrderItemSchema,
  salesOrderSchema,
  salesOrderItemSchema,
  inventorySchema,
  inventoryTransactionSchema,
  repackageInventorySchema,
  productCombinationsSchema,
  variantTypesSchema,
  variantValuesSchema,
};
