import {
  userSchema,
  loginSchema,
  categorySchema,
  productSchema,
  supplierSchema,
  purchaseOrderSchema,
  purchaseOrderItemSchema,
  salesOrderSchema,
  salesOrderItemSchema,
  signupSchema,
  inventorySchema,
  inventoryTransactionSchema,
  cancelPurchaseOrderSchema,
  repackageInventorySchema,
} from "../schemas";
import type { z } from "zod";

export interface ApiErrorResponse {
  message: string;
  code: string;
  errors: Record<string, string[]>;
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
type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
type CancelPurchaseOrder = z.infer<typeof cancelPurchaseOrderSchema>;
type SalesOrder = z.infer<typeof salesOrderSchema>;
type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
type Inventory = z.infer<typeof inventorySchema>;
type InventoryTransaction = z.infer<typeof inventoryTransactionSchema>;
type RepackageInventory = z.infer<typeof repackageInventorySchema>;

export type {
  User,
  Signup,
  Login,
  Category,
  Product,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  CancelPurchaseOrder,
  SalesOrder,
  SalesOrderItem,
  Inventory,
  InventoryTransaction,
  RepackageInventory,
};
