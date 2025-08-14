import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MODE_OF_PAYMENT, ORDER_STATUS } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import PurchaseOrderItemForm from "./PurchaseOrderItemForm";
import { PurchaseOrder, PurchaseOrderItem } from "@/types";
import SupplierPanel from "@/components/SupplierPanel";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import UnitBadge from "@/components/UnitBadge";
import { cx } from "class-variance-authority";
import { useMemo } from "react";
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

  const data = form.getValues();

  const columns = useMemo<ColumnDef<PurchaseOrderItem>[]>(
    () => [
      {
        accessorKey: "nameSnapshot",
        header: "Product",
      },
      {
        accessorKey: "variantSnapshot",
        header: "Variant",
        cell: ({ row }) => {
          const variantSnapshot = row.original.variantSnapshot;
          return Object.keys(variantSnapshot)
            .map((key) => `${key}: ${variantSnapshot[key]}`)
            .join(" | ");
        },
      },
      {
        header: "Original Price",
        accessorKey: "originalPrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.originalPrice ?? 0);
        },
      },
      {
        header: "Price",
        accessorKey: "purchasePrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.purchasePrice);
        },
      },
      {
        header: () => "Quantity",
        accessorKey: "quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        cell: ({ row }) => {
          return <UnitBadge>{String(row.original.unit)}</UnitBadge>;
        },
      },
      {
        header: () => <div className="text-right">Discount</div>,
        accessorKey: "discount",
        meta: {
          className: "text-right",
        },
      },
      {
        header: "Note",
        accessorKey: "discountNote",
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.original.totalAmount ?? 0),
      },
    ],
    [],
  );

  return (
    <Form {...form}>
      <form>
        <div className="md:flex md:justify-between">
          <div className="mb-4">
            <SupplierPanel supplier={data?.supplier} />
          </div>
          <div className="mb-4 text-sm">
            <div>
              {data?.modeOfPayment === MODE_OF_PAYMENT.CHECK && (
                <>
                  <div className="flex justify-between">
                    <div className="font-medium w-[150px]">Check Number</div>
                    {data?.checkNumber}
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
        <div>
          <PurchaseOrderItemForm
            fields={fields}
            columns={columns}
            errors={errors}
            control={form.control}
            name="purchaseOrderItems"
          />
        </div>

        <div className="flex flex-col gap-2">
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
        </div>
      </form>
    </Form>
  );
}
