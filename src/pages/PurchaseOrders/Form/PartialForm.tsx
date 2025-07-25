import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  purchaseOrderServices,
} from "@/services";
import { MODE_OF_PAYMENT, ORDER_STATUS, ROUTES } from "@/utils/definitions";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import SupplierPanel from "@/components/SupplierPanel";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useNavigate, useParams } from "react-router";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatters";
import { cx } from "class-variance-authority";
import Tooltip from "@/components/Tooltip";
import Table, { Amount } from "../Table";
import Badge from "@/components/Badge";
import { useMemo } from "react";
import { toast } from "sonner";
export default function PartialForm({
  form,
}: {
  form: UseFormReturn<PurchaseOrder>;
}) {
  const {
    control,
    formState: { errors },
  } = form;
  const { fields } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const data = form.getValues();
  async function onCompleteOrder(form: PurchaseOrder) {
    try {
      await purchaseOrderServices.update(id!, {
        ...form,
        status: ORDER_STATUS.COMPLETED,
      });

      toast.success(`Purchase Order completed successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }
  const columns = useMemo<ColumnDef<PurchaseOrderItem>[]>(
    () => [
      {
        accessorKey: "product.name",
        header: "Product",
      },
      {
        header: () => <div className="text-right">Unit Price</div>,
        accessorKey: "unitPrice",
        id: "unitPrice",
        meta: {
          className: "text-right",
          type: "currency",
        },
      },
      {
        header: () => <div className="text-right">Quantity</div>,
        accessorKey: "quantity",
        id: "quantity",
        size: 10,
        meta: {
          className: "text-right",
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        id: "unit",
        size: 10,
      },
      {
        header: () => <div className="text-right">Discount</div>,
        accessorKey: "discount",
        id: "discount",

        meta: {
          className: "text-right",
          type: "currency",
        },
      },
      {
        header: "Note",
        accessorKey: "discountNote",
        id: "discountNote",
      },
      {
        header: () => <div className="text-right">Amount</div>,
        accessorKey: "amount",
        id: "amount",
        meta: {
          className: "text-right",
          type: "currency",
        },
        cell: ({ row }) => {
          return <Amount index={row.index} control={control} />;
        },
      },
    ],
    [],
  );

  return (
    <>
      <div className="md:flex md:justify-between">
        <div className="mb-4">
          <SupplierPanel supplier={data?.supplier} />
        </div>
        <div className="mb-4">
          <div>
            {data?.modeOfPayment === MODE_OF_PAYMENT.CHECK && (
              <>
                <div className="flex">
                  <div className="font-medium w-[150px]">Check Number</div>
                  <Badge>{data?.checkNumber}</Badge>
                </div>
                <div className="flex">
                  <div className="font-medium w-[150px]">Due Date</div>
                  <span className={cx("text-red-500 font-semibold")}>
                    {data?.dueDate ? formatDate(data.dueDate) : "-"}
                  </span>
                </div>
              </>
            )}

            <div className="flex">
              <div className="font-medium w-[150px]">Delivery Date</div>
              {data?.deliveryDate ? formatDate(data.deliveryDate) : "-"}
            </div>
          </div>
        </div>
      </div>
      <FormField
        control={form.control}
        name="internalNotes"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Internal Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter some internal notes..."
                className="resize-none"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter some notes..."
                className="resize-none"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="purchaseOrderItems"
        render={() => (
          <Table
            control={form.control}
            data={fields}
            columns={columns}
            errors={errors}
          />
        )}
      />

      <div className="mt-auto mb-10">
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

        {data?.status === ORDER_STATUS.CANCELLED && (
          <>
            <FormItem className="mb-4">
              <FormLabel>Cancellation Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter some notes..."
                  className="resize-none"
                  defaultValue={data?.cancellationReason ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </>
        )}

        <div className="flex justify-end">
          {data?.status === ORDER_STATUS.RECEIVED && (
            <ConfirmDialog
              title="Complete Order"
              onConfirm={(e) => {
                e.preventDefault();
                console.log(form.formState.errors);
                form
                  .handleSubmit(onCompleteOrder)(e)
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              }}
            >
              <Button>Complete Order</Button>
            </ConfirmDialog>
          )}
        </div>
      </div>
    </>
  );
}
