import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROUTE_PERMISSIONS } from "@/utils/permissions";
import { ProtectedRoute } from "./ProtectedRoute";
import PriceManager from "@/pages/PriceManager";
import Popular from "@/pages/Reports/Popular";
import NoSales from "@/pages/Reports/NoSales";
import { ROUTES } from "@/utils/definitions";
import Profit from "@/pages/Reports/Profit";
import Forbidden from "@/pages/Forbidden";
import Dashboard from "@/pages/Dashboard";
import Loader from "@/components/Loader";
import Layout from "@/components/Layout";
import { useRoutes } from "react-router";
import NotFound from "@/pages/NotFound";
import { authServices } from "@/services";
import { useStore } from "@/stores";
import React, { lazy } from "react";

const Login = lazy(() => import("@/pages/LoginForm"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const Customers = lazy(() => import("@/pages/Customers"));
const Categories = lazy(() => import("@/pages/Categories"));
const ProductDetails = lazy(() => import("@/pages/Products/Details"));
const Products = lazy(() => import("@/pages/Products"));
const Users = lazy(() => import("@/pages/Users"));
const GoodReceiptCreate = lazy(() => import("@/pages/GoodReceipts/Create"));
const GoodReceiptDetails = lazy(() => import("@/pages/GoodReceipts/Details"));
const GoodReceipts = lazy(() => import("@/pages/GoodReceipts"));
const BreakPacks = lazy(() => import("@/pages/Inventory/BreakPacks"));
const StockAdjustments = lazy(() => import("@/pages/Reports/StockAdjustments"));
const Movements = lazy(() => import("@/pages/Reports/Movements"));
const SalesDetails = lazy(() => import("@/pages/SalesOrders/Details"));
const SalesOrders = lazy(() => import("@/pages/SalesOrders"));
const InvoiceDetails = lazy(() => import("@/pages/Invoices/Details"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Payments = lazy(() => import("@/pages/Payments"));
const PriceHistory = lazy(() => import("@/pages/Reports/PriceHistoryPage"));
const Reorders = lazy(() => import("@/pages/Reports/ReorderLevels"));
const Settings = lazy(() => import("@/pages/Settings"));
const ProductSearch = lazy(() => import("@/pages/ProductSearch"));
const SupplierDetails = lazy(() => import("@/pages/Suppliers/Details"));
const BarcodeScanner = lazy(() => import("@/pages/BarcodeScanner"));

export const AppRoutes = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { authState } = useStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    const initAuth = async () => {
      if (window.location.pathname === ROUTES.LOGIN) {
        setIsInitializing(false);
        return;
      }

      try {
        await authServices.refreshToken();
      } catch (error) {
        // Suppress initial failed refresh on boot (e.g. no session cookie)
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  React.useEffect(() => {
    if (user) {
      authState.setUser(user);
    }
  }, [user, authState]);

  const routes = [
    { path: ROUTES.LOGIN, element: <Login /> },
    {
      path: ROUTES.DASHBOARD,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.DASHBOARD]}>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.SUPPLIERS_DETAILS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPLIERS]}>
          <Layout>
            <SupplierDetails />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.SUPPLIERS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPLIERS]}>
          <Layout>
            <Suppliers />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.CUSTOMERS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.CUSTOMERS]}>
          <Layout>
            <Customers />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.CATEGORIES,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.CATEGORIES]}>
          <Layout>
            <Categories />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: `${ROUTES.PRODUCTS}/:id`,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.PRODUCTS]}>
          <Layout>
            <ProductDetails />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.PRODUCTS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.PRODUCTS]}>
          <Layout>
            <Products />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.USERS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.USERS]}>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.GOOD_RECEIPT_CREATE,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.GOOD_RECEIPT]}>
          <Layout>
            <GoodReceiptCreate />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: `${ROUTES.GOOD_RECEIPT}/:id`,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.GOOD_RECEIPT]}>
          <Layout>
            <GoodReceiptDetails />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.GOOD_RECEIPT,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.GOOD_RECEIPT]}>
          <Layout>
            <GoodReceipts />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.BREAK_PACKS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.BREAK_PACKS]}>
          <Layout>
            <BreakPacks />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.STOCK_ADJUSTMENTS,
      element: (
        <ProtectedRoute
          allowedRoles={ROUTE_PERMISSIONS[ROUTES.STOCK_ADJUSTMENTS]}
        >
          <Layout>
            <StockAdjustments />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.INVENTORY_MOVEMENTS,
      element: (
        <ProtectedRoute
          allowedRoles={ROUTE_PERMISSIONS[ROUTES.INVENTORY_MOVEMENTS]}
        >
          <Layout>
            <Movements />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: `${ROUTES.SALES_ORDERS}/:id`,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.SALES_ORDERS]}>
          <Layout>
            <SalesDetails />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.SALES_ORDERS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.SALES_ORDERS]}>
          <Layout>
            <SalesOrders />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: `${ROUTES.INVOICE_DETAILS}`,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.INVOICES]}>
          <Layout>
            <InvoiceDetails />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.INVOICES,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.INVOICES]}>
          <Layout>
            <Invoices />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.PAYMENTS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.PAYMENTS]}>
          <Layout>
            <Payments />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.PRICE_HISTORY,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.PRICE_HISTORY]}>
          <Layout>
            <PriceHistory />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.REORDERS,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.REORDERS]}>
          <Layout>
            <Reorders />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.REPORTS_POPULAR,
      element: (
        <ProtectedRoute
          allowedRoles={ROUTE_PERMISSIONS[ROUTES.REPORTS_POPULAR]}
        >
          <Layout>
            <Popular />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.REPORTS_PROFIT,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.REPORTS_PROFIT]}>
          <Layout>
            <Profit />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.REPORTS_NO_SALES,
      element: (
        <ProtectedRoute
          allowedRoles={ROUTE_PERMISSIONS[ROUTES.REPORTS_NO_SALES]}
        >
          <Layout>
            <NoSales />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "settings",
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS["settings"]}>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      ),
    },
    { path: ROUTES.SEARCH, element: <ProductSearch /> },
    { path: ROUTES.SCANNER, element: <BarcodeScanner /> },
    {
      path: ROUTES.PRICE_MANAGER,
      element: (
        <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS[ROUTES.PRICE_MANAGER]}>
          <Layout>
            <PriceManager />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: ROUTES.FORBIDDEN,
      element: <Forbidden />,
    },
    { path: "*", element: <NotFound /> },
  ];

  const element = useRoutes([...routes]);

  if (isInitializing) {
    return <Loader />;
  }

  const token = authState.token;
  if (isLoading && token) {
    return <Loader />;
  }

  if (user && !authState.user.id) {
    return <Loader />;
  }

  return <>{element}</>;
};
