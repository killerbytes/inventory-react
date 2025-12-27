import { formatLabel } from "@/lib/utils";
import { titleCase } from "title-case";

export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  SEARCH: "/search",
  USERS: "/users",
  PRODUCTS: "/products",
  VARIANTS: "/variants",
  CATEGORIES: "/categories",
  SUPPLIERS: "/suppliers",
  SUPPLIERS_DETAILS: "/suppliers/:id",
  CUSTOMERS: "/customers",
  GOOD_RECEIPT: "/good-receipt",
  GOOD_RECEIPT_CREATE: "/good-receipt/new",
  GOOD_RECEIPT_DETAILS: "/good-receipt/:id",
  SALES_ORDERS: "/sales",
  SALES_ORDERS_DETAILS: "/sales/:id",
  INVENTORY_MOVEMENTS: "/inventory/movements",
  STOCK_ADJUSTMENTS: "/stock-adjustments",
  BREAK_PACKS: "/break-packs",
  INVOICES: "/invoices",
  INVOICE_CREATE: "/invoices/new",
  INVOICE_DETAILS: "/invoices/:id",
  PAYMENTS: "/payments",
  PAYMENT_CREATE: "/payments/new",
  PAYMENT_DETAILS: "/payments/:id",
  PRICE_HISTORY: "/price-history",
  REORDERS: "/reorders",
  TEST: "/test",
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
  ALL: "ALL",
  IN: "IN",
  OUT: "OUT",
  ADJUSTMENT: "ADJUSTMENT",
  RETURN: "RETURN",
  CANCEL_PURCHASE: "CANCEL_PURCHASE",
  BREAK_PACK: "BREAK_PACK",
  RE_PACK: "RE_PACK",
};

export const INVENTORY_MOVEMENT_TYPE_OPTIONS = Object.values(
  INVENTORY_MOVEMENT_TYPE,
).map((value) => ({
  value,
  label: formatLabel(value),
}));

export const INVENTORY_MOVEMENT_TYPE_COLOR = {
  IN: "bg-orange-500 text-white",
  OUT: "bg-green-500 text-white",
  ADJUSTMENT: "ADJUST",
  RETURN: "text-red-600 border-red-600 bg-red-200",
  SUPPLIER_RETURN: "text-red-600 border-red-600 bg-red-200",
  EXCHANGE: "bg-green-500 border-black text-black",
  CANCELLATION: "text-red-500 border-red-500 bg-red-100",
  BREAK_PACK: "text-gray-500 border-gray-500 bg-gray-100",
  RE_PACK: "text-gray-100 border-gray-100 bg-gray-500",
};

export const INVENTORY_MOVEMENT_REFERENCE_TYPE = {
  GOOD_RECEIPT: "GOOD_RECEIPT",
  SALES_ORDER: "SALES_ORDER",
  STOCK_ADJUSTMENT: "STOCK_ADJUSTMENT",
  BREAK_PACK: "BREAK_PACK",
};

export const STATUS_COLOR = {
  VOID: "text-gray-400 border-gray-400 bg-gray-200",
  DRAFT: "text-white border-gray-600 bg-gray-500",
  RECEIVED: "text-orange-600 border-orange-600 bg-orange-100",
  POSTED: "text-orange-600 border-orange-600 bg-orange-100",
  PARTIALLY_PAID: "text-orange-600 border-orange-600 bg-orange-100",
  COMPLETED: "text-green-600 border-green-600 bg-green-100",
  PAID: "text-green-600 border-green-600 bg-green-100",
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
  PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [25, 50, 100],
};

export const DATE_FORMAT = "MMM-dd-yy";
export const DATETIME_FORMAT = "MMM-dd-yy h:mm:ss a";

export const STATUS = ["DRAFT", "RECEIVED", "COMPLETED", "CANCELLED"];

export const ORDER_STATUS = {
  ALL: "ALL",
  DRAFT: "DRAFT",
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
  CASH: "bg-green-400 text-white",
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
  DOZ: "DOZ",
};

export const WHOLESALE_UNITS = {
  RLS: "RLS",
  BOX: "BOX",
  BAG: "BAG",
  GAL: "GAL",
  PCK: "PCK",
  SET: "SET",
  DOZ: "DOZ",
};

export const UNIT_COLOR = {
  undefined: "text-black",
  PCS: "bg-green-100 text-black border-green-500",
  MTS: "bg-pink-100 text-black border-pink-500",
  FTS: "bg-lime-100 text-black border-lime-500",
  KGS: "bg-cyan-200 text-black border-cyan-500",
  LTS: "bg-teal-100 text-black border-teal-500",
  BTL: "bg--lime text-black border-lime-500",
  BOX: "bg-indigo-600 ",
  BAG: "bg-yellow-900",
  GAL: "bg-green-900",
  PCK: "bg-blue-900",
  SET: "bg-pink-900",
  RLS: "bg-purple-900",
  DOZ: "bg-orange-600",
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

export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  POSTED: "POSTED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
};

export const goodReceiptItemDefault = {
  combinationId: -1,
  discountNote: "",
  discount: 0,
  purchasePrice: 0,
  quantity: 0,
};
