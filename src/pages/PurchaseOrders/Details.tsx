import React, { useCallback } from "react";
import { MoveLeft } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services from "@/services";
import validations from "@/schemas";
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
import { DataTable } from "@/components/DataTable";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import formatCurrency from "@/utils";
import type { ColumnDef } from "@tanstack/react-table";

export default function Create() {
  const [data, setData] = React.useState<PurchaseOrder | null>(null);
  const [toggle, handleToggle] = useToggle({ confirmModal: false });
  const navigate = useNavigate();
  const { id } = useParams();

  async function onSubmit() {
    try {
      await services.purchaseOrderServices.updateStatus(id, {
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
      const response = await services.purchaseOrderServices.get(id);
      const data = response.data;
      setData(data);
    } catch (error) {
      navigate(ROUTES.PURCHASE_ORDERS);
      toast.error("Submission failed - " + error?.response.data.error.message);
    }
  }, []);

  React.useEffect(() => {
    getData();
  }, []);

  const columns: ColumnDef<PurchaseOrderItem>[] = [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">
          {(row.getValue("product") as PurchaseOrderItem["product"]).name}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      cell: ({ row }) => (
        <div className="text-right ">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-right">Unit Price</div>,
      cell: ({ row }) => (
        <div className="text-right ">
          {formatCurrency(row.getValue("unitPrice"))}
        </div>
      ),
    },
  ];

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
            <div className="flex">
              <div className="font-medium w-[150px]">Ordered By</div>
              {data?.orderByUser?.name}
            </div>
            <div className="flex">
              <div className="font-medium w-[150px]">Received By</div>
              {data?.receivedByUser?.name}
            </div>
          </div>
        </div>
      </div>

      <DataTable data={data?.purchaseOrderItems || []} columns={columns}>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total Amount</TableCell>
            <TableCell className="text-right">
              {data?.purchaseOrderItems &&
                formatCurrency(
                  data?.purchaseOrderItems.reduce(
                    (acc, item) => acc + item.unitPrice * item.quantity,
                    0
                  )
                )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </DataTable>
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
