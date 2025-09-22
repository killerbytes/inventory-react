import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  GLOBAL_COLOR,
  MODE_OF_PAYMENT,
  ORDER_STATUS,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import GoodReceiptItemForm from "../../../components/forms/OrderItemForm";
import OrderItemForm from "../../../components/forms/OrderItemForm";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { getTotalAmountTableFooter } from "@/lib/utils";
import SupplierPanel from "@/components/SupplierPanel";
import { GoodReceipt, GoodReceiptItem } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { cx } from "class-variance-authority";
import { Link } from "react-router";
import { useMemo } from "react";
export default function PartialForm({
  form,
}: {
  form: UseFormReturn<GoodReceipt>;
}) {
  const {
    control,
    formState: { errors },
  } = form;
  const { fields } = useFieldArray({
    control,
    name: "goodReceiptLines",
  });

  const data = form.getValues();

  const columns = useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => {
          return row.index + 1;
        },
      },
      {
        header: () => "Quantity",
        accessorKey: "quantity",
        meta: {
          headerClassName: "text-right w-10",
          className: "text-right",
        },
      },
      {
        accessorKey: "nameSnapshot",
        header: "Product",
        meta: {
          className: GLOBAL_COLOR.PRODUCT,
        },
        cell: ({ row }) => {
          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${row.original.combinations?.productId}`}
              className={cx("font-medium", GLOBAL_COLOR.PRODUCT)}
            >
              {row.original.nameSnapshot}
            </Link>
          );
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.unit)}
            </ColorBadge>
          );
        },
      },
      {
        header: () => <div className="text-right">Discount</div>,
        accessorKey: "discount",
        meta: {
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(Number(row.original.discount));
        },
      },
      {
        header: "Note",
        accessorKey: "discountNote",
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
        header: "Average Price",
        accessorKey: "averagePrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { quantity, purchasePrice, discount } = row.original;
          const priceAfterDiscount =
            (quantity * purchasePrice - discount) / quantity;
          return formatCurrency(priceAfterDiscount);
        },
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
              <>
                <div className="flex">
                  <div className="font-medium w-[150px]">Reference No</div>
                  <span>{data.referenceNo}</span>
                </div>
                <div className="flex">
                  <div className="font-medium w-[150px]">Receipt Date</div>
                  {data.receiptDate && (
                    <span>{formatDate(data.receiptDate)}</span>
                  )}
                </div>
              </>
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
          <OrderItemForm
            fields={fields}
            columns={columns}
            errors={errors}
            control={form.control}
            name="goodReceiptLines"
            renderFooter={(data) => {
              const total = getTotalAmountTableFooter(data);
              return (
                <TableRow>
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right font-bold"></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold"></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(total?.amount - total?.discount)}
                  </TableCell>
                </TableRow>
              );
            }}
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
