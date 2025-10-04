import StockAdjustments from "./pages/Inventory/StockAdjustments";
import GoodReceiptDetails from "./pages/GoodReceipts/Details";
import GoodReceiptCreate from "./pages/GoodReceipts/Create";
import { BrowserRouter, Routes, Route } from "react-router";
import PriceHistory from "./pages/Inventory/PriceHistory";
import SalesDetails from "./pages/SalesOrders/Details";
import BreakPacks from "./pages/Inventory/BreakPacks";
import ProductDetails from "./pages/Products/Details";
import InvoiceDetails from "./pages/Invoices/Details";
import Movements from "./pages/Inventory/Movements";
import GoodReceipts from "./pages/GoodReceipts";
import SalesOrders from "./pages/SalesOrders";
import { ROUTES } from "./utils/definitions";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Layout from "./components/Layout";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Test from "./pages/Test";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <BrowserRouter>
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
            path="settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />

          <Route
            path="test"
            element={
              <Layout>
                <Test />
              </Layout>
            }
          />

          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
