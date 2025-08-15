import { formatLabel } from "@/lib/utils";
import { titleCase } from "title-case";

export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  USERS: "/users",
  PRODUCTS: "/products",
  VARIANTS: "/variants",
  CATEGORIES: "/categories",
  SUPPLIERS: "/suppliers",
  CUSTOMERS: "/customers",
  PURCHASE_ORDERS: "/purchases",
  PURCHASE_ORDERS_CREATE: "/purchases/new",
  PURCHASE_ORDERS_DETAILS: "/purchases/:id",
  SALES_ORDERS: "/sales",
  SALES_ORDERS_CREATE: "/sales/new",
  SALES_ORDERS_DETAILS: "/sales/:id",
  INVENTORY_MOVEMENTS: "/inventory/movements",
  BREAK_PACKS: "/break-packs",
};

export const ORDER_TYPE = {
  SALE: "SALES",
  PURCHASE: "PURCHASE",
};

export const GLOBAL_COLOR = {
  PRODUCT: "text-orange-900",
  CATEGORY: "text-blue-900",
};

export const INVENTORY_MOVEMENT_TYPE = {
  IN: "IN",
  OUT: "OUT",
  ADJUST: "ADJUST",
  RETURN: "RETURN",
  CANCEL_PURCHASE: "CANCEL_PURCHASE",
  BREAK_PACK: "BREAK_PACK",
  RE_PACK: "RE_PACK",
};

export const INVENTORY_MOVEMENT_TYPE_COLOR = {
  IN: "bg-orange-500 text-white",
  OUT: "bg-green-500 text-white",
  ADJUST: "ADJUST",
  RETURN: "RETURN",
  CANCEL_PURCHASE: "text-red-500 border-red-500 bg-red-100",
  BREAK_PACK: "text-gray-500 border-gray-500 bg-gray-100",
  RE_PACK: "text-gray-100 border-gray-100 bg-gray-500",
};

export const STATUS_COLOR = {
  PENDING: "text-gray-600 border-gray-600 bg-gray-100",
  RECEIVED: "text-orange-600 border-orange-600 bg-orange-100",
  COMPLETED: "text-green-600 border-green-600 bg-green-100",
  CANCELLED: "text-red-600 border-red-600 bg-red-100",
  CASH: "text-green-400 border-green-400",
  CHECK: "text-yellow-500 border-yellow-500",
};

export const BUTTON_COLOR = {
  RECEIVED: "bg-orange-500 text-white",
  COMPLETED: "bg-green-600 text-white ",
};
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

export const MODE_OF_PAYMENT_COLOR = {
  CASH: "bg-green-400 text-black",
  CHECK: "bg-yellow-400 text-black",
};

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

export const BREAK_PACK_UNITS = [UNIT.BOX, UNIT.BAG, UNIT.GAL, UNIT.PACK];

export const UNIT_COLOR = {
  BOX: "bg-indigo-400 ",
  BAG: "bg-yellow-400 text-black",
  GAL: "bg-green-400 text-black",
  PACK: "bg-blue-500",
  SET: "bg-purple-400 text-black",
  PCS: "bg-red-500",
  KGS: "bg-orange-400",
};

export const UNIT_OPTIONS = Object.values(UNIT).map((value) => ({
  value,
  label: titleCase(value.toLowerCase()),
}));

export const ERROR = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
};
