import {
  GoodReceipt,
  GoodReceiptItem,
  GoodReceiptUpdate,
  ReturnItemInput,
  ReturnTransaction,
} from "@/schemas";
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
  ORDER_STATUS,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";
import ReturnExchangeModal from "@/components/modals/ReturnExchangeModal";
import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import SupplierPanel from "@/components/SupplierPanel";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router";
import { cx } from "class-variance-authority";
import useToggle from "@/hooks/useToggle";
import React, { useMemo } from "react";
import { useStore } from "@/stores";
export default function PartialForm({
  form,
}: {
  form: UseFormReturn<GoodReceiptUpdate>;
}) {
  const { id } = useParams();
  const { control } = form;
  const { fields } = useFieldArray({
    control,
    name: "goodReceiptLines",
  });
  const [toggle, handleToggle] = useToggle({ supplierReturnsModal: false });
  const [returns, setReturns] = React.useState<ReturnItemInput[]>([]);
  React.useState<ReturnTransaction[]>();
  const {
    goodReceiptState: { returnEnabled, setReturnEnabled },
  } = useStore();
  const data = form.getValues() as GoodReceipt;

  const watchGoodReceiptLines = useWatch({
    control: form?.control,
    name: "goodReceiptLines",
  }) as GoodReceiptItem[];

  const tableData = fields.map((field, index) => ({
    ...field, // id (structure)
    ...watchGoodReceiptLines?.[index], // values (reactive)
  }));

  const columns = useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      ...(returnEnabled
        ? [
            {
              id: "select",
              header: ({ table }: HeaderContext<GoodReceiptItem, unknown>) => (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                  aria-label="Select all"
                />
              ),
              cell: ({ row }: CellContext<GoodReceiptItem, unknown>) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ]
        : []),
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
          headerClassName: "text-right w-0",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
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
        accessorKey: "nameSnapshot",
        header: "Product",
        meta: {
          className: GLOBAL_COLOR.PRODUCT,
        },
        cell: ({ row }) => {
          return (
            <div className="flex gap-1">
              <Link
                to={`${ROUTES.PRODUCTS}/${row.original.combinations?.productId}`}
                className={cx("font-medium", GLOBAL_COLOR.PRODUCT)}
              >
                {row.original.nameSnapshot}
              </Link>
            </div>
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
            (quantity * purchasePrice - (discount ?? 0)) / quantity;
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
    [returnEnabled],
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

        <div className="flex flex-col gap-4">
          <DataTable
            data={tableData}
            columns={columns}
            onSelectionChange={(selectedItems) => {
              setReturns(
                selectedItems.map((i) => ({
                  ...i,
                  combination: i.combinations,
                  returnQuantity: i.quantity,
                })) as ReturnItemInput[],
              );
            }}
            renderFooter={(data) => {
              const total = data.reduce(
                (acc, item) => (acc += Number(item.totalAmount)),
                0,
              );
              return (
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell colSpan={10} className="text-right font-bold">
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              );
            }}
          />
          {returnEnabled && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => handleToggle({ supplierReturnsModal: true })}
              >
                Supplier Returns
              </Button>
            </div>
          )}
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
      {toggle.supplierReturnsModal && (
        <ReturnExchangeModal
          onClose={() => {
            handleToggle({ supplierReturnsModal: false });
            setReturnEnabled(false);
          }}
          returns={returns}
          referenceId={Number(id)}
        />
      )}
    </Form>
  );
}
