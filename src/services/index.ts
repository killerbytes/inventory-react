import AuthService from "./auth";
import CategoryService from "./categories";
import Http from "./http";
import ProductService from "./products";
import UserService from "./users";
import SupplierService from "./suppliers";
import PurchaseOrderService from "./purchaseOrder";
import InventoryService from "./inventory";
import SalesOrderService from "./salesOrder";
import type { z } from "zod";
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
  inventoryItemSchema,
} from "../schemas";

const http = new Http();

export default {
  authServices: new AuthService({ http }),
  categoryServices: new CategoryService({ http }),
  userServices: new UserService({ http }),
  productServices: new ProductService({ http }),
  supplierServices: new SupplierService({ http }),
  purchaseOrderServices: new PurchaseOrderService({ http }),
  inventoryServices: new InventoryService({ http }),
  salesOrderServices: new SalesOrderService({ http }),
};

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
type InventoryItem = z.infer<typeof inventoryItemSchema>;

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
  InventoryItem,
};
