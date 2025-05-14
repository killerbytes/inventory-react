import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Layout from "./components/Layout";
import Products from "./pages/Products";
import PurchaseOrders from "./pages/PurchaseOrders";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import PurchaseCreate from "./pages/PurchaseOrders/Create";
import { useApiData, type ApiDataType } from "./hooks/useApiData";
import { GlobalContext } from "./components/GlobalContext";
import { ROUTES } from "./utils/definitions";
import Login from "./pages/Login";

function App() {
  const props: ApiDataType = useApiData();

  return (
    <>
      <BrowserRouter>
        <GlobalContext.Provider value={props}>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route
              path={ROUTES.HOME}
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
              path={ROUTES.CATEGORIES}
              element={
                <Layout>
                  <Categories />
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
              path={ROUTES.PURCHASE_ORDERS}
              element={
                <Layout>
                  <PurchaseOrders />
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GlobalContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
