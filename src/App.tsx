import InventoryTransactions from "./pages/Inventory/Transactions";
import StockAdjustments from "./pages/Inventory/StockAdjustments";
import PurchaseOrderDetails from "./pages/PurchaseOrders/Details";
import { BrowserRouter, Routes, Route } from "react-router";
import PurchaseCreate from "./pages/PurchaseOrders/Create";
import SalesDetails from "./pages/SalesOrders/Details";
import BreakPacks from "./pages/Inventory/BreakPacks";
import ProductDetails from "./pages/Products/Details";
import SalesCreate from "./pages/SalesOrders/Create";
import Movements from "./pages/Inventory/Movements";
import PurchaseOrders from "./pages/PurchaseOrders";
import ProductEdit from "./pages/Products/Details";
import SalesOrders from "./pages/SalesOrders";
import { ROUTES } from "./utils/definitions";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Layout from "./components/Layout";
import Products from "./pages/Products";
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
            path={ROUTES.PURCHASE_ORDERS_CREATE}
            element={
              <Layout>
                <PurchaseCreate />
              </Layout>
            }
          />
          <Route
            path={`${ROUTES.PURCHASE_ORDERS}/:id`}
            element={
              <Layout>
                <PurchaseOrderDetails />
              </Layout>
            }
          />

          <Route
            path={ROUTES.PURCHASE_ORDERS}
            element={
              <Layout>
                <PurchaseOrders />
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
            path={ROUTES.SALES_ORDERS_CREATE}
            element={
              <Layout>
                <SalesCreate />
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
