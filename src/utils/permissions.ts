import { ROUTES } from "./definitions";

/**
 * Unified source of truth for Role-Based Access Control (RBAC) across the frontend.
 * This ensures that the AppRoutes and the AppSidebar always enforce the exact same permissions.
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  [ROUTES.DASHBOARD]: ["Admin", "Manager", "Cashier", "User"],
  [ROUTES.LOGIN]: [],
  [ROUTES.USERS]: ["Admin"],
  [ROUTES.PRODUCTS]: ["Admin", "Manager", "Cashier", "User"],
  [ROUTES.CATEGORIES]: ["Admin", "Manager", "Cashier"],
  [ROUTES.SUPPLIERS]: ["Admin", "Manager"],
  [ROUTES.CUSTOMERS]: ["Admin", "Manager", "Cashier"],
  [ROUTES.GOOD_RECEIPT]: ["Admin", "Manager", "Cashier"],
  [ROUTES.SALES_ORDERS]: ["Admin", "Manager", "Cashier"],
  [ROUTES.INVENTORY_MOVEMENTS]: ["Admin", "Manager", "Cashier", "User"],
  [ROUTES.STOCK_ADJUSTMENTS]: ["Admin", "Manager"],
  [ROUTES.BREAK_PACKS]: ["Admin", "Manager"],
  [ROUTES.INVOICES]: ["Admin", "Manager", "Cashier"],
  [ROUTES.PAYMENTS]: ["Admin", "Manager"],
  [ROUTES.PRICE_HISTORY]: ["Admin", "Manager", "Cashier"],
  [ROUTES.REORDERS]: ["Admin", "Manager", "Cashier"],
  [ROUTES.REPORTS_POPULAR]: ["Admin", "Manager", "Cashier", "User"],
  [ROUTES.REPORTS_PROFIT]: ["Admin", "Manager"],
  [ROUTES.REPORTS_NO_SALES]: ["Admin", "Manager", "Cashier", "User"],
  [ROUTES.PRICE_MANAGER]: ["Admin", "Manager"],
  settings: ["Admin", "Manager"],
};
