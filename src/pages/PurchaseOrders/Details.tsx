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
import PurchaseOrderForm from "./PurchaseOrderForm";
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

  const { purchaseOrderSchema } = validations;

  async function onSubmit(values: z.infer<typeof purchaseOrderSchema>) {
    try {
      await services.purchaseOrderServices.updateStatus(id, {
        status: ORDER_STATUS.COMPLETED,
      });
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_DRAFT`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  const getData = useCallback(async () => {
    try {
      const response = await services.purchaseOrderServices.get(id);
      const data = response.data;
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
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
          onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
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
        <div className="font-medium">Supplier</div>
        <div className="flex justify-between">
          <SupplierPanel supplier={data?.supplier as Supplier} />
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
        items={data?.purchaseOrderItems as PurchaseOrderItem[]}
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
                    form
                      .handleSubmit(onSubmit)(e)
                      .catch((error) => {
                        console.error("Form submission error:", error);
                      })
                      .finally(() => {
                        handleToggle({ confirmDialog: false });
                      });
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
