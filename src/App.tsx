import { BrowserRouter, Routes, Route } from "react-router";
import { ROUTES } from "./utils/definitions";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import Test from "./pages/Test";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Customers = lazy(() => import("./pages/Customers"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetails = lazy(() => import("./pages/Products/Details"));
const Products = lazy(() => import("./pages/Products"));
const Users = lazy(() => import("./pages/Users"));
const GoodReceiptCreate = lazy(() => import("./pages/GoodReceipts/Create"));
const GoodReceiptDetails = lazy(() => import("./pages/GoodReceipts/Details"));
const GoodReceipts = lazy(() => import("./pages/GoodReceipts"));
const BreakPacks = lazy(() => import("./pages/Inventory/BreakPacks"));
const StockAdjustments = lazy(
  () => import("./pages/Inventory/StockAdjustments"),
);
const Movements = lazy(() => import("./pages/Inventory/Movements"));
const SalesDetails = lazy(() => import("./pages/SalesOrders/Details"));
const SalesOrders = lazy(() => import("./pages/SalesOrders"));
const InvoiceDetails = lazy(() => import("./pages/Invoices/Details"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Payments = lazy(() => import("./pages/Payments"));
const PriceHistory = lazy(() => import("./pages/Inventory/PriceHistory"));
const Reorders = lazy(() => import("./pages/Inventory/Reorders"));
const Settings = lazy(() => import("./pages/Settings"));
const ProductSearch = lazy(() => import("./pages/ProductSearch"));
const SupplierDetails = lazy(() => import("./pages/Suppliers/Details"));

function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path={ROUTES.SUPPLIERS_DETAILS}
              element={
                <Layout>
                  <SupplierDetails />
                </Layout>
              }
            />

            <Route
              path={ROUTES.SUPPLIERS}
              element={
                <Layout>
                  <Suppliers />
                </Layout>
              }
            />
            <Route
              path={ROUTES.CUSTOMERS}
              element={
                <Layout>
                  <Customers />
                </Layout>
              }
            />

            <Route
              path={ROUTES.CATEGORIES}
              element={
                <Layout>
                  <Categories />
                </Layout>
              }
            />
            <Route
              path={`${ROUTES.PRODUCTS}/:id`}
              element={
                <Layout>
                  <ProductDetails />
                </Layout>
              }
            />
            <Route
              path={ROUTES.PRODUCTS}
              element={
                <Layout>
                  <Products />
                </Layout>
              }
            />
            <Route
              path={ROUTES.USERS}
              element={
                <Layout>
                  <Users />
                </Layout>
              }
            />
            <Route
              path={ROUTES.GOOD_RECEIPT_CREATE}
              element={
                <Layout>
                  <GoodReceiptCreate />
                </Layout>
              }
            />
            <Route
              path={`${ROUTES.GOOD_RECEIPT}/:id`}
              element={
                <Layout>
                  <GoodReceiptDetails />
                </Layout>
              }
            />

            <Route
              path={ROUTES.GOOD_RECEIPT}
              element={
                <Layout>
                  <GoodReceipts />
                </Layout>
              }
            />
            <Route
              path={ROUTES.BREAK_PACKS}
              element={
                <Layout>
                  <BreakPacks />
                </Layout>
              }
            />

            <Route
              path={ROUTES.STOCK_ADJUSTMENTS}
              element={
                <Layout>
                  <StockAdjustments />
                </Layout>
              }
            />
            <Route
              path={ROUTES.INVENTORY_MOVEMENTS}
              element={
                <Layout>
                  <Movements />
                </Layout>
              }
            />
            <Route
              path={`${ROUTES.SALES_ORDERS}/:id`}
              element={
                <Layout>
                  <SalesDetails />
                </Layout>
              }
            />

            <Route
              path={ROUTES.SALES_ORDERS}
              element={
                <Layout>
                  <SalesOrders />
                </Layout>
              }
            />
            <Route
              path={`${ROUTES.INVOICE_DETAILS}`}
              element={
                <Layout>
                  <InvoiceDetails />
                </Layout>
              }
            />
            <Route
              path={ROUTES.INVOICES}
              element={
                <Layout>
                  <Invoices />
                </Layout>
              }
            />
            <Route
              path={ROUTES.PAYMENTS}
              element={
                <Layout>
                  <Payments />
                </Layout>
              }
            />
            <Route
              path={ROUTES.PRICE_HISTORY}
              element={
                <Layout>
                  <PriceHistory />
                </Layout>
              }
            />
            <Route
              path={ROUTES.REORDERS}
              element={
                <Layout>
                  <Reorders />
                </Layout>
              }
            />

            <Route
              path="settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />

            <Route path={ROUTES.SEARCH} element={<ProductSearch />} />

            <Route path={ROUTES.TEST} element={<Test />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
