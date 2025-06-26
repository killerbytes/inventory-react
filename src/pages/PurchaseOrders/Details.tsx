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
import {
  purchaseOrderServices,
  type PurchaseOrder,
  type PurchaseOrderItem,
  type Supplier,
} from "@/services";
import { formatCurrency, formatDate, getStatus } from "@/utils/formatters";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { ORDER_STATUS, ROUTES } from "@/utils/definitions";
import { Test, DataTable } from "@/components/DataTable";
import { CircleCheckBig, MoveLeft } from "lucide-react";
import SupplierPanel from "@/components/SupplierPanel";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Tooltip from "@/components/Tooltip";
import React, { useCallback } from "react";
import CancelForm from "./CancelForm";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function Create() {
  const [data, setData] = React.useState<PurchaseOrder | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const nextStatus = getStatus(data?.status, true);

  async function onSubmit() {
    try {
      await purchaseOrderServices.updateStatus(parseInt(id as string), {
        status: nextStatus.key,
      } as PurchaseOrder);
      toast.success(`Purchase Order created successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  async function onSubmitCancel(form) {
    try {
      console.log(form);
      await purchaseOrderServices.updateStatus(parseInt(id as string), {
        ...form,
        status: ORDER_STATUS.CANCELLED.key,
      });

      toast.success(`Purchase Order canceled successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
      }
      if (error.response.data.code === "VALIDATION") {
        throw error;
      } else {
        toast.error(`Submission failed, ${error.response.data.error.message}`);
      }
    }
  }

  const getData = useCallback(async () => {
    try {
      const response = await purchaseOrderServices.get(id);
      const data = response.data;
      setData(data);
    } catch (error) {
      navigate(ROUTES.PURCHASE_ORDERS);
      toast.error("Submission failed - " + error?.response.data.error.message);
    }
  }, [id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

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
        >
          <MoveLeft /> Back
        </Button>
      </div>
      <div className="mb-4 md:flex md:justify-between items-center">
        <h1 className="my-4">Purchase Order #{id}</h1>
        <div className="flex gap-2">
          {data?.isCheckPayment && (
            <>
              <Badge
                className={cx("relative titlecase", `status-check-payment`)}
              >
                Check Payment
              </Badge>

              {data?.isCheckPaymentPaid && (
                <Badge className="text-white bg-green-700">
                  <CircleCheckBig size="1.5rem" /> Paid
                </Badge>
              )}
            </>
          )}
          {data?.status && (
            <Badge
              className={cx(
                "capitalize",
                `status-${data?.status.toLowerCase()}`,
              )}
            >
              {getStatus(data?.status).label}
            </Badge>
          )}
        </div>
      </div>
      <div className="md:flex md:justify-between">
        <div className="mb-4">
          <SupplierPanel supplier={data?.supplier as Supplier} />
        </div>
        <div className="mb-4">
          <div>
            {data?.isCheckPayment && (
              <div className="flex">
                <div className="font-medium w-[150px]">Due Date</div>
                <span
                  className={cx({
                    "text-red-500 font-semibold": !data?.isCheckPaymentPaid,
                  })}
                >
                  {data?.dueDate ? formatDate(data.dueDate) : "-"}
                </span>
              </div>
            )}

            <div className="flex">
              <div className="font-medium w-[150px]">Delivery Date</div>
              {data?.deliveryDate ? formatDate(data.deliveryDate) : "-"}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={data?.purchaseOrderItems || []}
        columns={columns}
        footer={
          <>
            <TableRow>
              <TableCell colSpan={2}>Total Amount</TableCell>
              <TableCell className="text-right">
                {data?.purchaseOrderItems &&
                  formatCurrency(
                    data?.purchaseOrderItems.reduce(
                      (acc, item) => acc + item.unitPrice * item.quantity,
                      0,
                    ),
                  )}
              </TableCell>
            </TableRow>
          </>
        }
      ></DataTable>
      <div className="mt-auto">
        <div className="mb-4">
          <div className="mb-4">
            <div className="flex gap-4">
              <div className="font-medium w-[150px]">Order Date</div>
              <Tooltip content={data?.orderByUser?.name}>
                <div>{data?.orderDate ? formatDate(data.orderDate) : "-"}</div>
              </Tooltip>
            </div>
            <div className="flex gap-4">
              <div className="font-medium w-[150px]">Received Date</div>
              {data?.receivedDate ? (
                <Tooltip content={data?.receivedByUser?.name}>
                  {formatDate(data.receivedDate)}
                </Tooltip>
              ) : (
                "-"
              )}
            </div>
            <div className="flex gap-4">
              <div className="font-medium w-[150px]">Completed Date</div>
              {data?.completedDate ? (
                <Tooltip content={data?.completedByUser?.name}>
                  {formatDate(data.completedDate)}
                </Tooltip>
              ) : (
                "-"
              )}
            </div>
            <div className="flex gap-4">
              <div className="font-medium w-[150px]">Cancelled Date</div>
              {data?.cancelledDate ? (
                <Tooltip content={data?.cancelledByUser?.name}>
                  {formatDate(data.cancelledDate)}
                </Tooltip>
              ) : (
                "-"
              )}
            </div>
          </div>
          {data?.status === ORDER_STATUS.CANCELLED.key && (
            <div className="mb-4">
              Cancellation Reason:
              <p>{data?.cancellationReason}</p>
            </div>
          )}
          <div className="mb-8">
            Notes:
            <p>{data?.notes}</p>
          </div>
        </div>
        <div className="mt-auto flex justify-end gap-4 align-end mb-4">
          <div className="ml-auto flex items-end">
            {data?.status === ORDER_STATUS.COMPLETED.key && (
              <CancelForm onSubmit={onSubmitCancel} />
            )}
            {data?.status !== ORDER_STATUS.COMPLETED.key &&
              data?.status !== ORDER_STATUS.CANCELLED.key && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="status-completed capitalize">
                      Order {nextStatus?.label}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirm <span>{nextStatus?.label}</span> order
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {nextStatus?.description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onSubmit}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
