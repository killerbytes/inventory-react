import React, { useCallback } from "react";
import { MoveLeft } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services from "@/services";
import validations from "@/utils/validations";
import type { Supplier } from "../Suppliers";
import { ORDER_STATUS, ROUTES } from "@/utils/definitions";
import { useNavigate, useParams } from "react-router";
import type { PurchaseOrder, PurchaseOrderItem } from ".";
import PurchaseOrderForm from "./SalesOrderForm";
import ProductsTable from "./ProductsTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useToggle from "@/hooks/useToggle";
import SupplierPanel from "@/components/SupplierPanel";
import { format } from "date-fns";
import { cx } from "class-variance-authority";

export default function Create() {
  const [data, setData] = React.useState<PurchaseOrder | null>(null);
  const [toggle, handleToggle] = useToggle({ confirmModal: false });
  const navigate = useNavigate();
  const { id } = useParams();

  async function onSubmit() {
    try {
      await services.salesOrderServices.updateStatus(id, {
        status: ORDER_STATUS.COMPLETED,
      });
      toast.success(`Purchase Order created successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  const getData = useCallback(async () => {
    try {
      const response = await services.salesOrderServices.get(id);
      const data = response.data;
      setData(data);
    } catch (error) {
      // if (error.status === 404) navigate(ROUTES.SALES_ORDERS);
      toast.error("Submission failed - " + error?.response.data.error.message);
    }
  }, []);

  React.useEffect(() => {
    getData();
  }, []);

  console.log(data);
  return (
    <>
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(ROUTES.SALES_ORDERS)}
          className="mb-4"
        >
          <MoveLeft /> Back
        </Button>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <h2>Purchase Order #{id}</h2>
        <div className={cx(`status-${data?.status.toLowerCase()}`)}>
          {data?.status}
        </div>
      </div>
      <div className="mb-12">
        <div className="font-medium">Customer</div>
        <div className="flex justify-between">
          {data?.customer}
          <div>
            <div className="flex">
              <div className="font-medium w-[150px]">Order Date</div>
              {data?.orderDate ? format(data.orderDate, "PPP") : "-"}
            </div>
            <div className="flex">
              <div className="font-medium w-[150px]">Delivery Date</div>
              {data?.deliveryDate ? format(data.deliveryDate, "PPP") : "-"}
            </div>
          </div>
        </div>
      </div>

      <ProductsTable
        items={data?.salesOrderItems as PurchaseOrderItem[]}
        className="mb-4"
      />
      <DialogFooter className="mt-auto">
        {data?.status === ORDER_STATUS.PENDING && (
          <AlertDialog
            open={toggle.confirmDialog}
            onOpenChange={() => {
              handleToggle({ confirmDialog: true });
            }}
          >
            <AlertDialogTrigger asChild>
              <Button>Complete Order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm completed order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to complete this order?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    onSubmit();
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DialogFooter>
    </>
  );
}
