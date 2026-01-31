import {
  breakPackSchema,
  cancelOrderSchema,
  categorySchema,
  customerSchema,
  inventoryMovementSchema,
  inventorySchema,
  loginSchema,
  productCombinationsSchema,
  productSchema,
  goodReceiptLineSchema,
  goodReceiptSchema,
  salesOrderFormSchema,
  salesOrderItemSchema,
  salesOrderSchema,
  signupSchema,
  statusHistorySchema,
  stockAdjustmentSchema,
  supplierSchema,
  userSchema,
  variantTypesSchema,
  variantValuesSchema,
  invoiceSchema,
  paymentSchema,
  invoiceLineSchema,
  paymentApplicationSchema,
  invoiceFormSchema,
  priceHistorySchema,
  returnSchema,
  returnItemSchema,
  exchangeItemSchema,
  goodReceiptCreateSchema,
  goodReceiptUpdateSchema,
  returnTransactionSchema,
  invoiceGoodReceiptSchema,
  supplierHistorySchema,
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

type User = z.infer<typeof userSchema>;
type Signup = z.infer<typeof signupSchema>;
type Login = z.infer<typeof loginSchema>;
type Category = z.infer<typeof categorySchema>;
type Product = z.infer<typeof productSchema>;
type Supplier = z.infer<typeof supplierSchema>;
type Customer = z.infer<typeof customerSchema>;
type GoodReceipt = z.infer<typeof goodReceiptSchema>;
type GoodReceiptCreate = z.infer<typeof goodReceiptCreateSchema>;
type GoodReceiptUpdate = z.infer<typeof goodReceiptUpdateSchema>;
type GoodReceiptItem = z.infer<typeof goodReceiptLineSchema>;
type CancelOrder = z.infer<typeof cancelOrderSchema>;
type SalesOrder = z.infer<typeof salesOrderSchema>;
type SalesOrderForm = z.infer<typeof salesOrderFormSchema>;
type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
type Inventory = z.infer<typeof inventorySchema>;
type VariantTypes = z.infer<typeof variantTypesSchema>;
type ProductCombinations = z.infer<typeof productCombinationsSchema>;
type VariantValues = z.infer<typeof variantValuesSchema>;
type BreakPack = z.infer<typeof breakPackSchema>;
type StatusHistory = z.infer<typeof statusHistorySchema>;
type InventoryMovement = z.infer<typeof inventoryMovementSchema>;
type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;
type Invoice = z.infer<typeof invoiceSchema>;
type InvoiceLine = z.infer<typeof invoiceLineSchema>;
type invoiceForm = z.infer<typeof invoiceFormSchema>;
type InvoiceGoodReceipt = z.infer<typeof invoiceGoodReceiptSchema>;
type Payment = z.infer<typeof paymentSchema>;
type PaymentApplication = z.infer<typeof paymentApplicationSchema>;
type priceHistory = z.infer<typeof priceHistorySchema>;
type ReturnItem = z.infer<typeof returnItemSchema>;
type ReturnTransaction = z.infer<typeof returnTransactionSchema>;
type ExchangeItem = z.infer<typeof exchangeItemSchema>;
type Return = z.infer<typeof returnSchema>;
type supplierHistory = z.infer<typeof supplierHistorySchema>;

export type {
  User,
  Signup,
  Login,
  Category,
  Product,
  Supplier,
  Customer,
  GoodReceipt,
  GoodReceiptCreate,
  GoodReceiptUpdate,
  GoodReceiptItem,
  CancelOrder,
  SalesOrder,
  SalesOrderForm,
  SalesOrderItem,
  Inventory,
  VariantTypes,
  ProductCombinations,
  VariantValues,
  BreakPack,
  StatusHistory,
  InventoryMovement,
  StockAdjustment,
  Invoice,
  invoiceForm,
  InvoiceLine,
  InvoiceGoodReceipt,
  Payment,
  PaymentApplication,
  priceHistory,
  ReturnItem,
  ExchangeItem,
  Return,
  ReturnTransaction,
  supplierHistory,
};
