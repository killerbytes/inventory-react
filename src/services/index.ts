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
} from "../schemas";
import PurchaseOrderService from "./purchaseOrder";
import SalesOrderService from "./salesOrder";
import CategoryService from "./categories";
import InventoryService from "./inventory";
import SupplierService from "./suppliers";
import ProductService from "./products";
import UserService from "./users";
import AuthService from "./auth";
import type { z } from "zod";
import Http from "./http";

const http = new Http();

// export default {
//   authServices: new AuthService({ http }),
//   categoryServices: new CategoryService({ http }),
//   userServices: new UserService({ http }),
//   productServices: new ProductService({ http }),
//   supplierServices: new SupplierService({ http }),
//   purchaseOrderServices: new PurchaseOrderService({ http }),
//   inventoryServices: new InventoryService({ http }),
// };

export const authServices = new AuthService({ http });
export const salesOrderServices = new SalesOrderService({ http });
export const purchaseOrderServices = new PurchaseOrderService({ http });
export const categoryServices = new CategoryService({ http });
export const userServices = new UserService({ http });
export const productServices = new ProductService({ http });
export const supplierServices = new SupplierService({ http });
export const inventoryServices = new InventoryService({ http });

export type APIResponse<T extends object> = {
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

type User = z.infer<typeof userSchema>;
type Signup = z.infer<typeof signupSchema>;
type Login = z.infer<typeof loginSchema>;
type Category = z.infer<typeof categorySchema>;
type Product = z.infer<typeof productSchema>;
type Supplier = z.infer<typeof supplierSchema>;
type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
type SalesOrder = z.infer<typeof salesOrderSchema>;
type SalesOrderItem = z.infer<typeof salesOrderItemSchema>;
type Inventory = z.infer<typeof inventorySchema>;
type InventoryTransaction = z.infer<typeof inventoryTransactionSchema>;

export type {
  User,
  Signup,
  Login,
  Category,
  Product,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  SalesOrder,
  SalesOrderItem,
  Inventory,
  InventoryTransaction,
};
