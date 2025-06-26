export const ROUTES = {
  HOME: "/",
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

export const ORDER_STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "RECEIVED", label: "Received" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const TRANSACTION_TYPE = {
  SALE: "SALE",
  PURCHASE: "PURCHASE",
  CANCELLATION: "CANCELLATION",
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "SALE", label: "Sale" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "CANCELLATION", label: "Cancellation" },
];

export const PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 20, 30],
};

export const DATE_FORMAT = "MMM-dd-yy";
export const DATETIME_FORMAT = "MMM-dd-yy h:mm:ss a";

export const STATUS = ["PENDING", "RECEIVED", "COMPLETED", "CANCELLED"];

export const ORDER_STATUS = {
  PENDING: {
    key: "PENDING",
    label: "Pending",
    description: "Order is pending, waiting for delivery",
  },
  RECEIVED: {
    key: "RECEIVED",
    label: "Received",
    description: "Order has been received by the hardware",
  },
  COMPLETED: {
    key: "COMPLETED",
    label: "Completed",
    description: "Order has been completed",
  },
  CANCELLED: {
    key: "CANCELLED",
    label: "Cancelled",
    description: "Order has been cancelled",
  },
};
