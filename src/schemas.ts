import { MODE_OF_PAYMENT, ORDER_STATUS } from "./utils/definitions";
import * as z from "zod";

export const userSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  isActive: z.boolean(),
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

export const formChangePasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
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

export const categoryBaseSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  parentId: z.number().nullish(),
  description: z.string(),
  order: z.number().nullish(),
});

export const categorySchema = categoryBaseSchema.extend({
  subCategories: z.array(categoryBaseSchema).nullish(),
});

export const inventorySchema = z.object({
  id: z.number(),
  product: z.any(),
  quantity: z.coerce.number(),
  parentId: z.number().nullish(),
  updatedAt: z.string().nullish(),
  averagePrice: z.coerce.number().nullish(),
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
  isBreakpackFilter: z.boolean().nullish(),
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
  baseUnit: z.string(),
  categoryId: z.number(),
  variants: z.array(variantTypesSchema).nullish(),
  products_name_unit: z.string().nullish(),
});

const productCombinationBaseSchema = z.object({
  productId: z.number(),
  name: z.string(),
  sku: z.string(),
  unit: z.string(),
});

export const productCombinationsSchema = productCombinationBaseSchema.extend({
  id: z.number(),
  conversionFactor: z.coerce.number().min(1, {
    message: "Conversion Factor must be at least 1.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "Price must be at least 0.01.",
  }),
  inventory: inventorySchema,
  product: productBaseSchema,
  reorderLevel: z.coerce.number(),
  isBreakPack: z.boolean().nullish(),
  isActive: z.boolean().nullish(),
  values: z.array(variantValuesSchema),
  isBreakPackOfId: z.coerce.number().nullish(),
});

export const returnItemSchema = z.object({
  combinationId: z.number(),
  combination: productCombinationBaseSchema.nullish(),
  returnQuantity: z.coerce.number(),
  purchasePrice: z.coerce.number(),
  discount: z.coerce.number(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number().optional(),
  totalAmount: z.coerce.number(),
  unit: z.string(),
  type: z.string().optional(),
});

export const productSchema = productBaseSchema.extend({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().nullish(),
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
  contact: z.string().nullish(),
  phone: z.string().min(2, {
    message: "Phone must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .nullish(),
});

export const customerSchema = supplierSchema;

export const goodReceiptLineBaseSchema = z.object({
  combinationId: z.number().min(1, { message: "Product is required." }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  purchasePrice: z.coerce
    .number()
    .min(0.01, { message: "Price must be at least 0.01." })
    .superRefine((val, ctx) => {
      if (isNaN(val)) {
        ctx.addIssue({ code: "custom", message: "Amount is required" });
      } else {
        const decimalPlaces = (val.toString().split(".")[1] || "").length;
        if (decimalPlaces > 2) {
          ctx.addIssue({
            code: "custom",
            message: "Max 2 decimal places allowed",
          });
        }
      }
    })
    .pipe(z.number().min(0)),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
  combinations: productCombinationBaseSchema.nullish(),
});

export const goodReceiptLineSchema = goodReceiptLineBaseSchema.extend({
  id: z.coerce.number().nullish(),
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
  changedBy: z.number(),
  changedAt: z.string(),
  user: z.any(),
});

const goodReceiptBaseSchema = z.object({
  supplierId: z.coerce
    .number({
      required_error: "Supplier is required",
      invalid_type_error: "Supplier is required",
    })
    .min(1, { message: "Supplier is required." }),
  internalNotes: z.string().nullish(),
  referenceNo: z.string().min(1, { message: "Reference Number is required." }),
  receiptDate: z.string(),
});

export const goodReceiptCreateSchema = goodReceiptBaseSchema.extend({
  goodReceiptLines: z.array(goodReceiptLineBaseSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const goodReceiptUpdateSchema = goodReceiptBaseSchema.extend({
  goodReceiptLines: z.array(goodReceiptLineBaseSchema).min(1, {
    message: "At least one product is required.",
  }),
  status: z.string().nullish(),
});
export const returnTransactionSchema = z.object({
  id: z.number().optional(),
  totalReturnAmount: z.coerce.number(),
  totalExchangeAmount: z.coerce.number(),
  sourceType: z.string(),
  updatedAt: z.string(),
  returnItems: z.array(returnItemSchema),
});

export const goodReceiptSchema = goodReceiptBaseSchema
  .extend({
    id: z.number(),
    status: z.string(),
    supplier: z.any(),
    cancellationReason: z.string().nullish(),
    totalAmount: z.string(),
    goodReceiptLines: z.array(goodReceiptLineSchema).min(1, {
      message: "At least one product is required.",
    }),
    goodReceiptStatusHistory: z.array(statusHistorySchema),
    returnTransactions: z.array(returnTransactionSchema),
    totalReturnAmount: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === ORDER_STATUS.DRAFT &&
      data.goodReceiptLines?.length === 0
    ) {
      ctx.addIssue({
        path: ["goodReceiptLines"],
        code: z.ZodIssueCode.custom,
        message: "Purchase Order Items are required",
      });
    }
  });

export const salesOrderItemBaseSchema = z.object({
  combinationId: z.coerce.number().min(1, {
    message: "Product must be selected.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  purchasePrice: z.coerce.number().min(0.01, {
    message: "Price must be at least 0.01.",
  }),
  discount: z.coerce.number().nullish(),
  discountNote: z.string().nullish(),
  combinations: productCombinationBaseSchema.nullish(),
});

export const salesOrderItemSchema = salesOrderItemBaseSchema.extend({
  id: z.coerce.number().nullish(),

  originalPrice: z.coerce.number().nullish(),
  totalAmount: z.coerce.number().nullish(),
  variantSnapshot: z.any().nullish(),
  skuSnapshot: z.string().nullish(),
  nameSnapshot: z.string().nullish(),
  unit: z.string().nullish(),
});

const salesOrderBaseSchema = z.object({
  id: z.number().optional(),
  status: z.string(),
  salesOrderNumber: z.string().nullish(),
  customerId: z.coerce.number().min(1, {
    message: "Customer is required.",
  }),
  orderDate: z.string(),
  isDelivery: z.boolean().optional(),
  isDeliveryCompleted: z.boolean().nullish(),
  deliveryAddress: z.string().nullish(),
  deliveryInstructions: z.string().nullish(),
  deliveryDate: z.string().nullish(),
  internalNotes: z.string().nullish(),
  notes: z.string().nullish(),
  dueDate: z.string().nullish(),
  modeOfPayment: z.enum(
    Object.values(MODE_OF_PAYMENT) as [string, ...string[]],
  ),
  checkNumber: z.string().nullish(),

  salesOrderItems: z.array(salesOrderItemBaseSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const salesOrderFormSchema = salesOrderBaseSchema.superRefine(
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
    totalAmount: z.string().optional(),
    customer: z.any(),
    cancellationReason: z.string().nullish(),
    returnTransactions: z.array(returnTransactionSchema),
    totalReturnAmount: z.string().optional(),
    totalExchangeAmount: z.string().optional(),
    salesOrderStatusHistory: z.array(statusHistorySchema),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === ORDER_STATUS.DRAFT &&
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
  user: z.any(),
  createdAt: z.string().nullish(),
});

export const inventoryMovementSchema = z.object({
  id: z.number().optional(),
  // inventoryId: z.number(),
  // inventory: z.any(),
  combination: productCombinationsSchema,
  quantity: z.number(),
  costPerUnit: z.number(),
  totalCost: z.number(),
  referenceId: z.string().nullish(),
  referenceType: z.string().nullish(),
  type: z.string(),
  reason: z.string(),
  updatedAt: z.date(),
  reference: z.number(),
});

export const stockAdjustmentSchema = z.object({
  referenceNo: z.string().nullish(),
  combinationId: z.number(),
  combination: productCombinationsSchema.optional(),
  systemQuantity: z.number().nullish(),
  newQuantity: z.number().min(0, {
    message: "New Quantity must be at least 0.",
  }),
  difference: z.number().nullish(),
  reason: z.string(),
  notes: z.string().min(1, {
    message: "Notes is required.",
  }),
  createdAt: z.string().nullish(),
  createdBy: z.number().nullish(),
});
export const invoiceLineSchema = z.object({
  amount: z.number(),
  goodReceiptId: z.number(),
  goodReceipt: goodReceiptSchema.nullish(),
});

export const invoiceFormSchema = z.object({
  id: z.number().optional(),
  supplierId: z.number().min(1, { message: "Supplier is required." }),
  invoiceNumber: z.string().min(1, { message: "Invoice Number is required." }),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
  notes: z.string().nullish(),
  gr: z.array(goodReceiptSchema).min(1, {
    message: "At least one Good Receipt is required.",
  }),
});

export const paymentApplicationSchema = z.object({
  id: z.number().optional(),
  invoiceId: z.number(),
  amountApplied: z.coerce.number().nullish(),
});

export const paymentSchema = z.object({
  id: z.number().optional(),
  supplierId: z.number(),
  supplier: supplierSchema,
  referenceNo: z.string().nullish(),
  paymentDate: z.string(),
  amount: z.coerce.number().nullish(),
  notes: z.string().nullish(),
  changedBy: z.number().nullish(),
  applications: z.array(paymentApplicationSchema).min(1, {
    message: "At least one product is required.",
  }),
});

export const invoiceSchema = z.object({
  id: z.number().optional(),
  supplierId: z.number(),
  supplier: supplierSchema,
  payment: paymentSchema,
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
  totalAmount: z.coerce.number().nullish(),
  notes: z.string().nullish(),
  invoiceLines: z.array(invoiceLineSchema),
  applications: z.array(paymentApplicationSchema),
});

export const priceHistorySchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  combinations: productCombinationsSchema,
  fromPrice: z.number(),
  toPrice: z.number(),
  changedBy: z.number(),
  changedAt: z.string(),
  user: z.any(),
  quantity: z.coerce.number(),
});

export const exchangeItemSchema = returnItemSchema.omit({
  returnQuantity: true,
  totalAmount: true,
  unit: true,
});

export const returnSchema = z.object({
  returns: z.array(returnItemSchema),
  exchanges: z.array(exchangeItemSchema).optional(),
  reason: z.string(),
});
