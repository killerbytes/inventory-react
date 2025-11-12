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
import ReturnExchangeModal from "@/components/modals/ReturnExchangeModal";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { getTotalAmountTableFooter } from "@/lib/utils";
import SupplierPanel from "@/components/SupplierPanel";
import { GoodReceiptItem, ReturnItem } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router";
import { inventoryServices } from "@/services";
import { cx } from "class-variance-authority";
import useToggle from "@/hooks/useToggle";
import React, { useMemo } from "react";
import { format } from "path";
export default function PartialForm({
  form,
  returnEnabled,
}: {
  form: UseFormReturn;
  returnEnabled: boolean;
}) {
  const { id } = useParams();
  const { control } = form;
  const { fields } = useFieldArray({
    control,
    name: "goodReceiptLines",
  });
  const [toggle, handleToggle] = useToggle({ supplierReturnsModal: false });
  const [hasReturns, setHasReturns] = React.useState(false);
  const [returns, setReturns] = React.useState<ReturnItem[]>([]);
  const [returnItems, setReturnItems] = React.useState<ReturnItem[]>([]);
  const [returnTransactions, setReturnTransactions] =
    React.useState<ReturnTransaction[]>(null);

  const data = form.getValues();

  React.useEffect(() => {
    const getReturns = async () => {
      try {
        const returns = await inventoryServices.getReturnTransaction(
          Number(id),
        );
        if (returns.length > 0) {
          setHasReturns(true);
          setReturnTransactions(returns);
          const returnItems = await Promise.all(
            returns.map(async (i) => {
              const returnItems = await inventoryServices.getReturnItems(i.id);
              return returnItems;
            }),
          );
          setReturnItems(returnItems.flat());
        }
      } catch (error) {
        console.log(error);
      }
    };

    getReturns();
  }, [id]);

  const columns = useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      ...(returnEnabled
        ? [
            {
              id: "select",
              header: ({ table }) => (
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
              cell: ({ row }) => (
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
          headerClassName: "text-right w-10",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
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

  const returnItemsColumns = useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      {
        header: "Id",
        accessorKey: "returnTransactionId",
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        meta: {
          headerClassName: "text-right w-10",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        accessorKey: "combination.name",
        header: "Product",
      },
      {
        header: "Unit",
        accessorKey: "combination.unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.combination.unit)}
            </ColorBadge>
          );
        },
      },
      {
        header: "Reason",
        accessorKey: "reason",
      },
      {
        header: "Price",
        accessorKey: "unitPrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.unitPrice);
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

  const returnTransactionsColumns = useMemo(
    () => [
      {
        header: "Id",
        accessorKey: "id",
      },

      {
        accessorKey: "totalReturnAmount",
        header: "Return Amount",
        cell: ({ row }) => {
          return formatCurrency(row.original.totalReturnAmount);
        },
      },

      {
        header: "Date",
        accessorKey: "updatedAt",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatDate(row.original.updatedAt);
        },
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

        <div className="flex flex-col gap-4">
          <DataTable
            data={fields}
            columns={columns}
            onSelectionChange={(selectedItems) => {
              console.log(selectedItems);

              setReturns(
                selectedItems.map((i) => ({
                  ...i,
                  returnQuantity: i.quantity,
                })) as ReturnItem[],
              );
            }}
            showFooter
            renderFooter={(data) => {
              const total = getTotalAmountTableFooter(data);
              return (
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right font-bold"></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold"></TableCell>
                  <TableCell></TableCell>
                  <TableCell colSpan={10} className="text-right font-bold">
                    {formatCurrency(total?.amount - total?.discount)}
                  </TableCell>
                </TableRow>
              );
            }}
          />
          {returnEnabled && (
            <Button
              type="button"
              onClick={() => handleToggle({ supplierReturnsModal: true })}
            >
              Supplier Returns
            </Button>
          )}
          {hasReturns && (
            <>
              <DataTable
                data={returnTransactions || []}
                columns={returnTransactionsColumns}
                showFooter
                renderFooter={(data) => {
                  const total = data.reduce(
                    (acc, item) => (acc += Number(item.totalReturnAmount)),
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
              <DataTable
                data={returnItems}
                columns={returnItemsColumns}
                showFooter
                renderFooter={(data) => {
                  const total = data.reduce(
                    (acc, item) => (acc += Number(item.totalAmount)),
                    0,
                  );
                  return (
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right font-bold"></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold"></TableCell>
                      <TableCell></TableCell>
                      <TableCell colSpan={10} className="text-right font-bold">
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            </>
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
          onClose={() => handleToggle({ supplierReturnsModal: false })}
          returns={returns}
          referenceId={Number(id)}
        />
      )}
    </Form>
  );
}
