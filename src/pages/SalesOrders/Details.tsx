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
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { type PurchaseOrderItem, type SalesOrder } from "@/services";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { ORDER_STATUS, ROUTES } from "@/utils/definitions";
import type { ColumnDef } from "@tanstack/react-table";
import { DialogFooter } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { salesOrderServices } from "@/services";
import { cx } from "class-variance-authority";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";

export default function SalesOrderDetails() {
  const [data, setData] = React.useState<SalesOrder | null>(null);
  const [toggle, handleToggle] = useToggle({ confirmModal: false });
  const navigate = useNavigate();
  const { id } = useParams();

  async function onSubmit() {
    try {
      await salesOrderServices.updateStatus(parseInt(id as string), {
        status: ORDER_STATUS.COMPLETED,
      } as SalesOrder);
      toast.success(`Sales Order completed successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response?.data?.error);
    }
  }
  const getData = useCallback(async () => {
    try {
      const response = await salesOrderServices.get(id);
      const data = response.data;
      setData(data);
    } catch (error) {
      if (error?.response?.status === 404) navigate(ROUTES.SALES_ORDERS);
      toast.error(
        `Failed to load order - ${error?.response?.data?.error?.message}`,
      );
    }
  }, [id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  async function onSubmitCancel() {
    try {
      await salesOrderServices.updateStatus(parseInt(id as string), {
        status: ORDER_STATUS.CANCELLED,
      } as SalesOrder);

      toast.success(`Purchase Order canceled successfully`);
      getData();
      // navigate(ROUTES.SALES_ORDERS);
    } catch (error: unknown) {
      toast.error(`Submission failed, ${error.response.data.error.message}`);
    }
  }

  const columns: ColumnDef<PurchaseOrderItem>[] = [
    {
      accessorKey: "inventory",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("inventory")?.product?.name}
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
      accessorKey: "originalPrice",
      header: () => <div className="text-right">Original Price</div>,
      cell: ({ row }) => {
        return (
          <div
            className={cx(
              "text-right",
              {
                "text-red-500":
                  row.getValue("unitPrice") < row.getValue("originalPrice"),
              },
              {
                "text-green-500":
                  row.getValue("unitPrice") > row.getValue("originalPrice"),
              },
            )}
          >
            {formatCurrency(row.getValue("originalPrice"))}
          </div>
        );
      },
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-right">Unit Price</div>,
      meta: {
        className: "text-right",
      },
    },
  ];

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
        <h2>Sales Order #{id}</h2>
        {data?.status && (
          <div className={cx(`status-${data?.status.toLowerCase()}`)}>
            {data?.status}
          </div>
        )}
      </div>
      <div className="mb-12">
        <div className="font-medium">Customer</div>
        <div className="flex justify-between">
          {data?.customer}
          <div>
            <div className="flex">
              <div className="font-medium w-[150px]">Order Date</div>
              {data?.orderDate ? formatDateTime(data.orderDate) : "-"}
            </div>
            <div className="flex">
              <div className="font-medium w-[150px]">Delivery Date</div>
              {data?.deliveryDate ? formatDateTime(data.deliveryDate) : "-"}
            </div>
            <div className="flex">
              <div className="font-medium w-[150px]">Received By</div>
              {data?.receivedByUser?.name}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={data?.salesOrderItems || []}
        columns={columns}
        footer={
          <TableRow>
            <TableCell colSpan={2}>Total Amount</TableCell>
            <TableCell className="text-right">
              {data?.salesOrderItems &&
                formatCurrency(
                  data?.salesOrderItems.reduce(
                    (acc, item) => acc + item.originalPrice * item.quantity,
                    0,
                  ),
                )}
            </TableCell>
            <TableCell className="text-right">
              {data?.salesOrderItems &&
                formatCurrency(
                  data?.salesOrderItems.reduce(
                    (acc, item) => acc + item.unitPrice * item.quantity,
                    0,
                  ),
                )}
            </TableCell>
          </TableRow>
        }
      ></DataTable>
      <DialogFooter className="mt-auto">
        {data?.status === ORDER_STATUS.COMPLETED && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Cancel Order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm cancel order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this order?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onSubmitCancel}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

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
