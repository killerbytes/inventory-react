import {
  ReturnItem,
  ReturnTransaction,
  SalesOrder,
  SalesOrderItem,
} from "@/types";
import { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";
import ReturnTransactionsTable from "@/components/ReturnTransactionsTable";
import ReturnExchangeModal from "@/components/modals/ReturnExchangeModal";
import { GLOBAL_COLOR, UNIT_COLOR } from "@/utils/definitions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router";
import { inventoryServices } from "@/services";
import { Label } from "@/components/ui/label";
import { useSalesOrderStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import React from "react";

const renderFooter = (data: SalesOrder) => {
  return (
    <>
      <TableRow>
        <TableCell>Total Amount</TableCell>
        <TableCell colSpan={10} className="text-right">
          {formatCurrency(Number(data?.totalAmount))}
        </TableCell>
      </TableRow>
    </>
  );
};

export default function StaticDataTable({ data }: { data: SalesOrder }) {
  const { id } = useParams();
  const [toggle, handleToggle] = useToggle({ returnExchangeModal: false });
  const [returns, setReturns] = React.useState<ReturnItem[]>();
  const [returnItems, setReturnItems] = React.useState<ReturnItem[]>([]);
  const [hasReturnItems, setHasReturnItems] = React.useState<boolean>(false);
  const { returnEnabled, setReturnEnabled } = useSalesOrderStore();
  const [returnTransactions, setReturnTransactions] =
    React.useState<ReturnTransaction[]>();

  const getReturns = React.useCallback(async () => {
    try {
      const returnsTransactions = await inventoryServices.getReturnTransaction(
        Number(id),
      );
      if (returnsTransactions.length > 0) {
        setReturnTransactions(returnsTransactions);
        setHasReturnItems(true);

        const returnItems = await Promise.all(
          returnsTransactions.map(async (i) => {
            const returnItems = await inventoryServices.getReturnItems(i.id);
            return returnItems;
          }),
        );
        setReturnItems(returnItems.flat());
      }
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  React.useEffect(() => {
    getReturns();
  }, [getReturns]);

  const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
    () => [
      ...(returnEnabled
        ? [
            {
              id: "select",
              meta: {
                headerClassName: "w-auto",
                className: "w-0",
              },
              header: ({ table }: HeaderContext<SalesOrderItem, unknown>) => (
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
              cell: ({ row }: CellContext<SalesOrderItem, unknown>) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
              ),
            },
          ]
        : []),
      {
        accessorKey: "nameSnapshot",
        header: "Product",
        meta: {
          className: GLOBAL_COLOR.PRODUCT,
        },
        cell: ({ row }) => {
          return (
            <Link to={`/products/${row.original.combinations.productId}`}>
              {row.original.nameSnapshot}
            </Link>
          );
        },
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
    [returnEnabled],
  );

  const returnItemsColumns = React.useMemo<ColumnDef<ReturnItem>[]>(
    () => [
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
              {String(row.original.combination?.unit)}
            </ColorBadge>
          );
        },
      },
      {
        header: "Type",
        accessorKey: "type",
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
          return formatCurrency(row.original.unitPrice || 0);
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
    <div className="flex flex-col gap-4">
      <DataTable
        data={data.salesOrderItems || []}
        columns={columns}
        renderFooter={() => renderFooter(data)}
        showFooter
        onSelectionChange={(selectedItems) => {
          setReturns(
            selectedItems.map((i) => ({
              ...i,
              returnQuantity: i.quantity,
            })) as ReturnItem[],
          );
        }}
      />
      {returnEnabled && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => handleToggle({ returnExchangeModal: true })}
          >
            Returns/Exchange
          </Button>
        </div>
      )}
      {hasReturnItems && (
        <>
          <Label className="font-bold">Return Transactions</Label>
          <ReturnTransactionsTable data={returnTransactions} />
          <Label className="font-bold">Return / Exchange Items</Label>
          <DataTable
            data={returnItems}
            columns={returnItemsColumns}
            showFooter
            renderFooter={(data) => {
              const total = data.reduce(
                (acc, item) =>
                  (acc +=
                    item.type === "RETURN" ? Number(item.totalAmount) : 0),
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
      {toggle.returnExchangeModal && (
        <ReturnExchangeModal
          onClose={() => {
            handleToggle({ returnExchangeModal: false });
            getReturns();
            setReturnEnabled(false);
          }}
          returns={returns}
          referenceId={Number(data.id)}
          salesOrder
        />
      )}
    </div>
  );
}
