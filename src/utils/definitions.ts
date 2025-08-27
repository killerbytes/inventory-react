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
  STOCK_ADJUSTMENTS: "/stock-adjustments",
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
  EWALLET: "EWALLET",
  BANK: "BANK",
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

// export const BASE_UNIT = {};
export const UNIT = {
  PCS: "PCS",
  KGS: "KGS",
  BTL: "BTL",
  RLS: "RLS",
  MTS: "MTS",
  FTS: "FTS",
  LTS: "LTS",
  BOX: "BOX",
  BAG: "BAG",
  GAL: "GAL",
  PCK: "PCK",
  SET: "SET",
};

export const BREAK_PACK_UNITS = [UNIT.BOX, UNIT.BAG, UNIT.GAL, UNIT.PCK];

export const UNIT_COLOR = {
  undefined: "text-black",
  PCS: "bg-green-100 text-black border-green-500",
  MTS: "bg-red-200 text-black border-red-500 ",
  KGS: "bg-blue-200 text-black border-blue-500",
  BOX: "bg-indigo-900 ",
  BAG: "bg-yellow-900",
  GAL: "bg-green-900",
  PACK: "bg-blue-900",
  SET: "bg-purple-900",
  RLS: "bg-purple-900",
};

// export const BASE_UNIT_OPTIONS = Object.values(BASE_UNIT).map((value) => ({
//   value,
//   label: titleCase(value.toLowerCase()),
// }));

export const UNIT_OPTIONS = Object.values(UNIT).map((value) => ({
  value,
  label: titleCase(value.toLowerCase()),
}));

export const ERROR = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
};

export const STOCK_ADJUSTMENT_TYPE = {
  DAMAGED: "DAMAGED",
  LOST: "LOST",
  EXPIRED: "EXPIRED",
  SAMPLE: "SAMPLE",
  FOUND: "FOUND",
  ERROR_CORRECTION: "ERROR_CORRECTION",
  SUPPLIER_BONUS: "SUPPLIER_BONUS",
  RETURN_TO_STOCK: "RETURN_TO_STOCK",
  OTHER: "OTHER",
};

export const STOCK_ADJUSTMENT_TYPE_OPTIONS = Object.values(
  STOCK_ADJUSTMENT_TYPE,
).map((value) => ({
  value,
  label: formatLabel(value),
}));

export const STOCK_ADJUSTMENT_TYPE_COLOR = {
  DAMAGED: "bg-red-500 text-white",
  LOST: "bg-red-500 text-white",
  EXPIRED: "bg-red-500 text-white",
  FOUND: "bg-green-500 text-white",
  SAMPLE: "bg-green-500 text-white",
  ERROR_CORRECTION: "bg-yellow-500 text-white",
  SUPPLIER_BONUS: "bg-green-500 text-white",
  RETURN_TO_STOCK: "bg-green-500 text-white",
  OTHER: "bg-gray-500 text-white",
};
