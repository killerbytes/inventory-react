import OutstandingGoodReceiptsCards from "@/features/dashboard/components/OutstandingGoodReceiptsCard";
import RecentInventoryMovements from "@/features/dashboard/components/RecentInventoryMovements";
import LastMonthProfitCard from "@/features/dashboard/components/LastMonthProfitCard";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import RecentSalesOrders from "@/features/dashboard/components/RecentSalesOrders";
import SalesOrderModal from "@/features/sales-orders/components/SalesOrderModal";
import WeeklySalesGraph from "@/features/dashboard/components/WeekSalesGraph";
import StockAlertCard from "@/features/dashboard/components/StockAlertCard";
import SalesOrderCard from "@/features/dashboard/components/SalesOrderCard";
import AddSupplierModal from "../../features/suppliers/components/AddModal";
import MostPopular from "@/features/dashboard/components/MostPopular";
import DeadStock from "@/features/dashboard/components/DeadStock";
import LowStock from "@/features/dashboard/components/LowStock";
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
      <div className="flex flex-col gap-6 md:gap-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-12">
          <SalesOrderCard />
          <OutstandingGoodReceiptsCards />
          <StockAlertCard />
          <LastMonthProfitCard />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-12">
          <Button
            className="shadow-md !bg-green-500 "
            onClick={() => {
              handleToggle({ salesOrderModal: true });
            }}
          >
            <Plus /> Sales Order
          </Button>

          <Link
            to={ROUTES.GOOD_RECEIPT_CREATE}
            className={cx(
              buttonVariants({ variant: "default" }),
              "shadow-md !bg-orange-500 ",
            )}
          >
            <Plus /> Good Receipt
          </Link>

          <Button
            className="shadow-sm !bg-gray-500"
            onClick={() => {
              handleToggle({ createProductModal: true });
            }}
          >
            <Plus /> Product
          </Button>

          <Button
            className="shadow-sm !bg-purple-500"
            onClick={() => {
              handleToggle({ addCustomerModal: true });
            }}
          >
            <Plus /> Customer
          </Button>

          <Button
            className="shadow-sm !bg-cyan-500"
            onClick={() => {
              handleToggle({ addSupplierModal: true });
            }}
          >
            <Plus /> Supplier
          </Button>
        </div>

        <RecentSalesOrders />
        <RecentInventoryMovements />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-12">
          <DeadStock />
          <LowStock />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-12">
          <WeeklySalesGraph />
          <MostPopular />
        </div>
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
