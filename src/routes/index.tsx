import PriceManager from "@/pages/PriceManager";
import Popular from "@/pages/Reports/Popular";
import NoSales from "@/pages/Reports/NoSales";
import { ROUTES } from "@/utils/definitions";
import Profit from "@/pages/Reports/Profit";
import Dashboard from "@/pages/Dashboard";
import Layout from "@/components/Layout";
import { useRoutes } from "react-router";
import NotFound from "@/pages/NotFound";
import { lazy } from "react";

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
  const routes = [
    { path: ROUTES.LOGIN, element: <Login /> },
    {
      path: ROUTES.DASHBOARD,
      element: (
        <Layout>
          <Dashboard />
        </Layout>
      ),
    },
    {
      path: ROUTES.SUPPLIERS_DETAILS,
      element: (
        <Layout>
          <SupplierDetails />
        </Layout>
      ),
    },
    {
      path: ROUTES.SUPPLIERS,
      element: (
        <Layout>
          <Suppliers />
        </Layout>
      ),
    },
    {
      path: ROUTES.CUSTOMERS,
      element: (
        <Layout>
          <Customers />
        </Layout>
      ),
    },
    {
      path: ROUTES.CATEGORIES,
      element: (
        <Layout>
          <Categories />
        </Layout>
      ),
    },
    {
      path: `${ROUTES.PRODUCTS}/:id`,
      element: (
        <Layout>
          <ProductDetails />
        </Layout>
      ),
    },
    {
      path: ROUTES.PRODUCTS,
      element: (
        <Layout>
          <Products />
        </Layout>
      ),
    },
    {
      path: ROUTES.USERS,
      element: (
        <Layout>
          <Users />
        </Layout>
      ),
    },
    {
      path: ROUTES.GOOD_RECEIPT_CREATE,
      element: (
        <Layout>
          <GoodReceiptCreate />
        </Layout>
      ),
    },
    {
      path: `${ROUTES.GOOD_RECEIPT}/:id`,
      element: (
        <Layout>
          <GoodReceiptDetails />
        </Layout>
      ),
    },
    {
      path: ROUTES.GOOD_RECEIPT,
      element: (
        <Layout>
          <GoodReceipts />
        </Layout>
      ),
    },
    {
      path: ROUTES.BREAK_PACKS,
      element: (
        <Layout>
          <BreakPacks />
        </Layout>
      ),
    },
    {
      path: ROUTES.STOCK_ADJUSTMENTS,
      element: (
        <Layout>
          <StockAdjustments />
        </Layout>
      ),
    },
    {
      path: ROUTES.INVENTORY_MOVEMENTS,
      element: (
        <Layout>
          <Movements />
        </Layout>
      ),
    },
    {
      path: `${ROUTES.SALES_ORDERS}/:id`,
      element: (
        <Layout>
          <SalesDetails />
        </Layout>
      ),
    },
    {
      path: ROUTES.SALES_ORDERS,
      element: (
        <Layout>
          <SalesOrders />
        </Layout>
      ),
    },
    {
      path: `${ROUTES.INVOICE_DETAILS}`,
      element: (
        <Layout>
          <InvoiceDetails />
        </Layout>
      ),
    },
    {
      path: ROUTES.INVOICES,
      element: (
        <Layout>
          <Invoices />
        </Layout>
      ),
    },
    {
      path: ROUTES.PAYMENTS,
      element: (
        <Layout>
          <Payments />
        </Layout>
      ),
    },
    {
      path: ROUTES.PRICE_HISTORY,
      element: (
        <Layout>
          <PriceHistory />
        </Layout>
      ),
    },
    {
      path: ROUTES.REORDERS,
      element: (
        <Layout>
          <Reorders />
        </Layout>
      ),
    },
    {
      path: ROUTES.REPORTS_POPULAR,
      element: (
        <Layout>
          <Popular />
        </Layout>
      ),
    },
    {
      path: ROUTES.REPORTS_PROFIT,
      element: (
        <Layout>
          <Profit />
        </Layout>
      ),
    },
    {
      path: ROUTES.REPORTS_NO_SALES,
      element: (
        <Layout>
          <NoSales />
        </Layout>
      ),
    },
    {
      path: "settings",
      element: (
        <Layout>
          <Settings />
        </Layout>
      ),
    },
    { path: ROUTES.SEARCH, element: <ProductSearch /> },
    { path: ROUTES.SCANNER, element: <BarcodeScanner /> },
    {
      path: ROUTES.PRICE_MANAGER,
      element: (
        <Layout>
          <PriceManager />
        </Layout>
      ),
    },
    { path: "*", element: <NotFound /> },
  ];

  const element = useRoutes([...routes]);

  return <>{element}</>;
};
