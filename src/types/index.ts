import {
  breakPackSchema,
  cancelOrderSchema,
  categorySchema,
  customerSchema,
  exchangeItemSchema,
  goodReceiptCreateSchema,
  goodReceiptLineSchema,
  goodReceiptSchema,
  goodReceiptUpdateSchema,
  inventoryMovementSchema,
  inventorySchema,
  invoiceBaseSchema,
  invoiceFormSchema,
  invoiceGoodReceiptSchema,
  invoiceLineSchema,
  invoiceSchema,
  loginSchema,
  paymentApplicationSchema,
  paymentSchema,
  priceHistorySchema,
  productCombinationsSchema,
  productCombinationUpdateSchema,
  productSchema,
  returnItemSchema,
  returnSchema,
  returnTransactionSchema,
  salesOrderFormSchema,
  salesOrderItemSchema,
  salesOrderSchema,
  signupSchema,
  statusHistorySchema,
  stockAdjustmentSchema,
  supplierHistorySchema,
  supplierSchema,
  userSchema,
  variantTypesSchema,
  variantValuesSchema,
} from "../schemas";
import type { z } from "zod";

type ValidationError = {
  field: string;
  message: string;
};

export interface ApiErrorResponse {
  code: string;
  details: string;
  errors: ValidationError[];
  message: string;
  statusCode: number;
}

export interface Summary {
  label: string;
  value: number;
}

export type PaginatedResponse<T extends object> = {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
  summary?: Summary[];
};

export interface ApiError {
  field?: string;
  message: string;
}

export interface filterProps {
  limit?: number;
  page?: number;
  q?: string;
  type?: string;
  sort?: string;
  status?: string;
  order?: "ASC" | "DESC";
}

export interface pagerProps {
  meta: { totalPages: number };
  filter: filterProps;
  setFilter: React.Dispatch<React.SetStateAction<filterProps>>;
}

export interface CategorizedItemList<T> {
  categoryId: string;
  categoryName: string;
  items: T[];
}

export interface CategorizedProductList {
  categoryId: number;
  categoryName: string;
  categoryOrder: number;
  products: Product[];
}

export interface CategorizedInventoryList {
  categoryId: number;
  categoryName: string;
  inventories: Inventory[];
}

export type User = z.infer<typeof userSchema>;
export type Signup = z.infer<typeof signupSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type GoodReceipt = z.infer<typeof goodReceiptSchema>;
export type GoodReceiptCreate = z.infer<typeof goodReceiptCreateSchema>;
export type GoodReceiptUpdate = z.infer<typeof goodReceiptUpdateSchema>;
export type GoodReceiptItem = z.infer<typeof goodReceiptLineSchema>;
export type CancelOrder = z.infer<typeof cancelOrderSchema>;
export type SalesOrder = z.infer<typeof salesOrderSchema>;
export type SalesOrderForm = z.infer<typeof salesOrderFormSchema>;
export type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
export type Inventory = z.infer<typeof inventorySchema>;
export type VariantTypes = z.infer<typeof variantTypesSchema>;
export type ProductCombinations = z.infer<typeof productCombinationsSchema>;
export type ProductCombinationUpdate = z.infer<
  typeof productCombinationUpdateSchema
>;
export type VariantValues = z.infer<typeof variantValuesSchema>;
export type BreakPack = z.infer<typeof breakPackSchema>;
export type StatusHistory = z.infer<typeof statusHistorySchema>;
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;
export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceCreate = z.infer<typeof invoiceBaseSchema>;
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type invoiceForm = z.infer<typeof invoiceFormSchema>;
export type InvoiceGoodReceipt = z.infer<typeof invoiceGoodReceiptSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentApplication = z.infer<typeof paymentApplicationSchema>;
export type priceHistory = z.infer<typeof priceHistorySchema>;
export type ReturnItem = z.infer<typeof returnItemSchema>;
export type ReturnTransaction = z.infer<typeof returnTransactionSchema>;
export type ExchangeItem = z.infer<typeof exchangeItemSchema>;
export type Return = z.infer<typeof returnSchema>;
export type supplierHistory = z.infer<typeof supplierHistorySchema>;
