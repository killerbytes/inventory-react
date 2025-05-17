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

export const ORDER_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const PAGINATION = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 30],
};
