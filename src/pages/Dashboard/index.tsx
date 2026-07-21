import OutstandingGoodReceiptsCards from "@/features/dashboard/components/OutstandingGoodReceiptsCard";
import RecentInventoryMovements from "@/features/dashboard/components/RecentInventoryMovements";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import RecentSalesOrders from "@/features/dashboard/components/RecentSalesOrders";
import LastMonthProfitCard from "@/features/dashboard/components/LastMonthProfit";
import SalesOrderModal from "@/features/sales-orders/components/SalesOrderModal";
import StockAlertCard from "@/features/dashboard/components/StockAlertCard";
import SalesOrderCard from "@/features/dashboard/components/SalesOrderCard";
import AddSupplierModal from "../../features/suppliers/components/AddModal";
import { Button, buttonVariants } from "@/components/ui/button";
import AddCustomerModal from "../Customers/AddModal";
import PageHeader from "@/components/PageHeader";
import { cx } from "class-variance-authority";
import useToggle from "@/hooks/useToggle";
import { ROUTES } from "@/routes/routes";
import { Link } from "react-router";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [toggle, handleToggle] = useToggle({
    salesOrderModal: false,
    createProductModal: false,
    addCustomerModal: false,
  });
  return (
    <>
      <PageHeader title="Dashboard"></PageHeader>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <SalesOrderCard />
          <LastMonthProfitCard />
          <StockAlertCard />
          <OutstandingGoodReceiptsCards />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Link
            to={ROUTES.GOOD_RECEIPT_CREATE}
            className={cx(
              buttonVariants({ variant: "default" }),
              "shadow-md !bg-orange-500 text-white",
            )}
          >
            <Plus /> Good Receipt
          </Link>

          <Button
            className="shadow-md "
            onClick={() => {
              handleToggle({ salesOrderModal: true });
            }}
          >
            <Plus /> Sales Order
          </Button>

          <Button
            className="shadow-sm"
            onClick={() => {
              handleToggle({ createProductModal: true });
            }}
          >
            <Plus /> Product
          </Button>

          <Button
            className="shadow-sm"
            onClick={() => {
              handleToggle({ addCustomerModal: true });
            }}
          >
            <Plus /> Customer
          </Button>

          <Button
            className="shadow-sm"
            onClick={() => {
              handleToggle({ addSupplierModal: true });
            }}
          >
            <Plus /> Supplier
          </Button>
        </div>

        <RecentSalesOrders />
        <RecentInventoryMovements />
      </div>

      {toggle.salesOrderModal && (
        <SalesOrderModal
          isOpen={toggle.salesOrderModal}
          onClose={() => {
            handleToggle({
              salesOrderModal: false,
            });
          }}
        />
      )}
      {toggle.createProductModal && (
        <CreateProductModal
          isOpen={true}
          onClose={() => {
            handleToggle({ createProductModal: false });
          }}
        />
      )}

      {toggle.addCustomerModal && (
        <AddCustomerModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addCustomerModal: false });
          }}
        />
      )}

      {toggle.addSupplierModal && (
        <AddSupplierModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addSupplierModal: false });
          }}
        />
      )}
    </>
  );
}
