import {
  breakPackSchema,
  cancelPurchaseOrderSchema,
  categorySchema,
  inventoryMovementSchema,
  inventorySchema,
  inventoryTransactionSchema,
  loginSchema,
  productCombinationsSchema,
  productSchema,
  purchaseOrderCreateSchema,
  purchaseOrderItemSchema,
  purchaseOrderSchema,
  repackageInventorySchema,
  salesOrderItemSchema,
  salesOrderSchema,
  signupSchema,
  statusHistorySchema,
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

export interface Filter {
  limit: number;
  page: number;
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
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
type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
type PurchaseOrderCreate = z.infer<typeof purchaseOrderCreateSchema>;
type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
type CancelPurchaseOrder = z.infer<typeof cancelPurchaseOrderSchema>;
type SalesOrder = z.infer<typeof salesOrderSchema>;
type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
type Inventory = z.infer<typeof inventorySchema>;
type InventoryTransaction = z.infer<typeof inventoryTransactionSchema>;
type RepackageInventory = z.infer<typeof repackageInventorySchema>;
type VariantTypes = z.infer<typeof variantTypesSchema>;
type ProductCombinations = z.infer<typeof productCombinationsSchema>;
type VariantValues = z.infer<typeof variantValuesSchema>;
type BreakPack = z.infer<typeof breakPackSchema>;
type StatusHistory = z.infer<typeof statusHistorySchema>;
type InventoryMovement = z.infer<typeof inventoryMovementSchema>;

export type {
  User,
  Signup,
  Login,
  Category,
  Product,
  Supplier,
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderItem,
  CancelPurchaseOrder,
  SalesOrder,
  SalesOrderItem,
  Inventory,
  InventoryTransaction,
  RepackageInventory,
  VariantTypes,
  ProductCombinations,
  VariantValues,
  BreakPack,
  StatusHistory,
  InventoryMovement,
};
