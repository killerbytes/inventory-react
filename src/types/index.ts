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
  goodReceiptCreateSchema,
  goodReceiptLineSchema,
  goodReceiptSchema,
  salesOrderCreateSchema,
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

export type PaginatedResponse<T extends object> = {
  data: T;
  total: number;
  totalPages: number;
  currentPage: number;
};

export interface ApiError {
  field?: string;
  message: string;
}

export interface filterProps {
  limit: number;
  page: number;
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

export interface CategorizedItemList<T> {
  categoryId: string;
  categoryName: string;
  items: T[];
}

export interface CategorizedProductList {
  categoryId: string;
  categoryName: string;
  categoryOrder: number;
  products: Product[];
  subCategories: CategorizedProductList[];
}

export interface CategorizedInventoryList {
  categoryId: string;
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
type GoodReceiptItem = z.infer<typeof goodReceiptLineSchema>;
type CancelOrder = z.infer<typeof cancelOrderSchema>;
type SalesOrder = z.infer<typeof salesOrderSchema>;
type SalesOrderCreate = z.infer<typeof salesOrderCreateSchema>;
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
type Payment = z.infer<typeof paymentSchema>;
type PaymentApplication = z.infer<typeof paymentApplicationSchema>;
type priceHistory = z.infer<typeof priceHistorySchema>;

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
  GoodReceiptItem,
  CancelOrder,
  SalesOrder,
  SalesOrderCreate,
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
  Payment,
  PaymentApplication,
  priceHistory,
};
