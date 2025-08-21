import { MODE_OF_PAYMENT, ORDER_STATUS } from "./utils/definitions";
import { create } from "domain";
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

//  export const loginSchema = z
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

export const categorySchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
});

export const inventorySchema = z.object({
  id: z.number(),
  product: z.any(),
  quantity: z.coerce.number(),
  parentId: z.number().nullish(),
  updatedAt: z.string().nullish(),
});

export const variantValuesSchema = z.object({
  id: z.number().nullish(),
  value: z.string().min(1, { message: "Value is required." }),
  variantTypeId: z.number().nullish(),
});
export const variantTypesSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name is required." }),
  productId: z.number().nullish(),
  isTemplate: z.boolean().nullish(),
  values: z
    .array(variantValuesSchema)
    .min(1, { message: "At least one value" }),
});

export const productBaseSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
  sku: z.string().nullish(),
  unit: z.string(),
  categoryId: z.number(),
  conversionFactor: z.coerce.number().nullish(),
  variants: z.array(variantTypesSchema).nullish(),
  products_name_unit: z.string().nullish(),
});

export const productCombinationsSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  name: z.string().nullish(),
  sku: z.string().nullish(),
  price: z.coerce.number().min(1, {
    message: "Price must be at least 1.",
  }),
  reorderLevel: z.coerce.number(),
  values: z.array(variantValuesSchema),
  inventory: inventorySchema.nullish(),
  product: productBaseSchema.nullish(),
});

export const productSchema = productBaseSchema.extend({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
  unit: z.string(),
  categoryId: z.number(),
  variants: z.array(variantTypesSchema).nullish(),
  combinations: z.array(productCombinationsSchema).nullish(),
  products_name_unit: z.string().nullish(),
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

export const customerSchema = supplierSchema;

export const purchaseOrderItemSchema = z.object({
  id: z.coerce.number().nullish(),
  combinationId: z.coerce
    .number()
    .min(1, {
      message: "Product must be selected.",
    })
    .nullable(),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  originalPrice: z.coerce.number().nullish(),
  purchasePrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
  totalAmount: z.coerce.number().nullish(),
  variantSnapshot: z.any().nullish(),
  skuSnapshot: z.string().nullish(),
  nameSnapshot: z.string().nullish(),
  unit: z.string().nullish(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(2, {
    message: "Reason must be at least 2 characters.",
  }),
});

export const statusHistorySchema = z.object({
  id: z.number().optional(),
  status: z.string(),
  changedBy: z.string(),
  changedAt: z.string(),
  user: z.any(),
});

const purchaseOrderBaseSchema = z.object({
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
  deliveryDate: z.string(),
  dueDate: z.string().nullish(),
  modeOfPayment: z.enum(
    Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
  ),
  checkNumber: z.string().nullish(),
});
export const purchaseOrderCreateSchema = purchaseOrderBaseSchema.superRefine(
  (data, ctx) => {
    // if (
    //   data.status === ORDER_STATUS.PENDING &&
    //   data.purchaseOrderItems?.length === 0
    // ) {
    //   ctx.addIssue({
    //     path: ["purchaseOrderItems"],
    //     code: z.ZodIssueCode.custom,
    //     message: "Purchase Order Items are required",
    //   });
    // }
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
  },
);

export const purchaseOrderSchema = purchaseOrderBaseSchema
  .extend({
    // id: z.number().optional(),
    // purchaseOrderNumber: z
    //   .string({
    //     required_error: "PO number is required",
    //   })
    //   .min(2, { message: "PO number is required" }),
    // supplierId: z.coerce
    //   .number({
    //     required_error: "Supplier is required",
    //     invalid_type_error: "Supplier is required",
    //   })
    //   .min(1, { message: "Supplier is required." }),
    // internalNotes: z.string().nullish(),
    // notes: z.string().nullish(),
    // purchaseOrderItems: z
    //   .array(purchaseOrderItemSchema)
    //   .min(1, {
    //     message: "At least one product is required.",
    //   })
    //   .nullish(),
    status: z.string(),
    purchaseOrderStatusHistory: z.array(statusHistorySchema).nullish(),
    totalAmount: z.string().optional(),
    supplier: z.any(),
    // deliveryDate: z.string(),
    // dueDate: z.string().nullish(),
    cancellationReason: z.string().nullish(),
    // modeOfPayment: z.enum(
    //   Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
    // ),
    // checkNumber: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === ORDER_STATUS.PENDING &&
      data.purchaseOrderItems?.length === 0
    ) {
      ctx.addIssue({
        path: ["purchaseOrderItems"],
        code: z.ZodIssueCode.custom,
        message: "Purchase Order Items are required",
      });
    }
    if (data.modeOfPayment === MODE_OF_PAYMENT.CHECK && !data.checkNumber) {
      ctx.addIssue({
        path: ["checkNumber"],
        code: z.ZodIssueCode.custom,
        message: "Check number is required when payment is by check",
      });
      // ctx.addIssue({
      //   path: ["dueDate"],
      //   code: z.ZodIssueCode.custom,
      //   message: "Due date is required when payment is by check",
      // });
    }
  });

export const salesOrderItemSchema = z.object({
  id: z.coerce.number().nullish(),
  combinationId: z.coerce
    .number()
    .min(1, {
      message: "Product must be selected.",
    })
    .nullable(),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  originalPrice: z.coerce.number().nullish(),
  purchasePrice: z.coerce.number().min(1, {
    message: "Unit Price must be at least 1.",
  }),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
  totalAmount: z.coerce.number().nullish(),
  variantSnapshot: z.any().nullish(),
  skuSnapshot: z.string().nullish(),
  nameSnapshot: z.string().nullish(),
  unit: z.string().nullish(),
});

const salesOrderBaseSchema = z.object({
  id: z.number().optional(),
  salesOrderNumber: z
    .string({
      required_error: "SO number is required",
    })
    .min(2, { message: "SO number is required" }),
  customerId: z.coerce.number().min(1, {
    message: "Customer is required.",
  }),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date().nullish(),
  isDelivery: z.boolean().optional(),
  isDeliveryCompleted: z.boolean().nullish(),
  deliveryAddress: z.string().nullish(),
  deliveryInstructions: z.string().nullish(),
  // deliveryDate: z.string(),
  internalNotes: z.string().nullish(),
  notes: z.string().nullish(),
  salesOrderItems: z.array(salesOrderItemSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const salesOrderCreateSchema = salesOrderBaseSchema.superRefine(
  (data, ctx) => {
    if (data.isDelivery && !data.deliveryDate) {
      ctx.addIssue({
        path: ["deliveryDate"],
        code: z.ZodIssueCode.custom,
        message: "Delivery date is required when delivery is selected",
      });
    }
    if (data.isDelivery && !data.deliveryAddress) {
      ctx.addIssue({
        path: ["deliveryAddress"],
        code: z.ZodIssueCode.custom,
        message: "Delivery address is required when delivery is selected",
      });
    }
  },
);

export const salesOrderSchema = salesOrderBaseSchema
  .extend({
    status: z.string(),
    salesOrderStatusHistory: z.array(statusHistorySchema),
    totalAmount: z.string().optional(),
    customer: z.any(),
    cancellationReason: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === ORDER_STATUS.PENDING &&
      data.salesOrderItems?.length === 0
    ) {
      ctx.addIssue({
        path: ["salesOrderItems"],
        code: z.ZodIssueCode.custom,
        message: "Sales Order Items are required",
      });
    }
    if (data.modeOfPayment === MODE_OF_PAYMENT.CHECK && !data.checkNumber) {
      ctx.addIssue({
        path: ["checkNumber"],
        code: z.ZodIssueCode.custom,
        message: "Check number is required when payment is by check",
      });
    }
  });

export const breakPackSchema = z.object({
  fromCombinationId: z.number(),
  fromCombination: productCombinationsSchema.nullish(),
  toCombinationId: z.number(),
  toCombination: productCombinationsSchema.nullish(),
  quantity: z.number().refine((val) => !isNaN(val), {
    message: "Number must not be NaN",
  }),
  conversionFactor: z.number().min(1, {
    message: "Units per Pack must be at least 1.",
  }),
  user: z.any(),
  createdAt: z.string().nullish(),
});

export const inventoryMovementSchema = z.object({
  id: z.number().optional(),
  // inventoryId: z.number(),
  // inventory: z.any(),
  combination: productCombinationsSchema,
  quantity: z.number(),
  previous: z.number(),
  new: z.coerce.number(),
  type: z.string(),
  reason: z.string(),
  updatedAt: z.date(),
  reference: z.number(),
});

export const stockAdjustmentSchema = z.object({
  referenceNo: z.string().nullish(),
  combinationId: z.number(),
  systemQuantity: z.number().nullish(),
  newQuantity: z.number(),
  difference: z.number().nullish(),
  reason: z.string(),
  notes: z.string().nullish(),
  createdAt: z.string().nullish(),
  createdBy: z.number().nullish(),
});
