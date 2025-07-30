import { formatLabel } from "@/lib/utils";
import { titleCase } from "title-case";

export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  USERS: "/users",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  SUPPLIERS: "/suppliers",
  PURCHASE_ORDERS: "/purchases",
  PURCHASE_ORDERS_CREATE: "/purchases/new",
  PURCHASE_ORDERS_DETAILS: "/purchases/:id",
  SALES_ORDERS: "/sales",
  SALES_ORDERS_CREATE: "/sales/new",
  SALES_ORDERS_DETAILS: "/sales/:id",

  INVENTORY: "/inventory",
  INVENTORY_TRANSACTIONS: "/inventory/transactions",
};

export const ORDER_TYPE = {
  SALE: "SALES",
  PURCHASE: "PURCHASE",
};

export const INVENTORY_TRANSACTION_TYPE = {
  PURCHASE: "PURCHASE",
  SALE: "SALE",
  PRICE_ADJUSTMENT: "PRICE_ADJUSTMENT",
  RETURN: "RETURN",
  CANCELLATION: "CANCELLATION",
  BREAK_PACK: "BREAK_PACK",
  REPACK: "REPACK",
};

export const INVENTORY_TRANSACTION_TYPE_OPTIONS = Object.values(
  INVENTORY_TRANSACTION_TYPE,
).map((value) => ({
  value,
  label: formatLabel(value),
}));

export const PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 20, 30],
};

export const DATE_FORMAT = "MMM-dd-yy";
export const DATETIME_FORMAT = "MMM-dd-yy h:mm:ss a";

export const STATUS = ["PENDING", "RECEIVED", "COMPLETED", "CANCELLED"];

export const ORDER_STATUS = {
  ALL: "ALL",
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};
export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS).map(
  (value) => ({
    value,
    label: formatLabel(value),
  }),
);

export const MODE_OF_PAYMENT = {
  CASH: "CASH",
  CHECK: "CHECK",
} as const;

export const MODE_OF_PAYMENT_OPTIONS = Object.values(MODE_OF_PAYMENT).map(
  (value) => ({
    value,
    label: titleCase(value.toLowerCase()),
  }),
);

export const UNIT = {
  BOX: "BOX",
  BAG: "BAG",
  GAL: "GAL",
  PACK: "PACK",
  SET: "SET",
  PCS: "PCS",
  KGS: "KGS",
};

export const UNIT_COLOR = {
  BOX: "bg-indigo-400",
  BAG: "bg-yellow-400",
  GAL: "bg-green-400",
  PACK: "bg-blue-400",
  SET: "bg-purple-400",
  PCS: "bg-red-400",
  KGS: "bg-orange-400",
};

export const UNIT_OPTIONS = Object.values(UNIT).map((value) => ({
  value,
  label: titleCase(value.toLowerCase()),
}));
