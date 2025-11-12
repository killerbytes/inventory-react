import ReturnExchangeModal from "@/components/modals/ReturnExchangeModal";
import { ReturnItem, SalesOrder, SalesOrderItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { GLOBAL_COLOR, UNIT_COLOR } from "@/utils/definitions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { inventoryServices } from "@/services";
import useToggle from "@/hooks/useToggle";
import { useParams } from "react-router";
import React from "react";

const renderFooter = (data: SalesOrder) => {
  return (
    <>
      <TableRow>
        <TableCell colSpan={7}>Total Amount</TableCell>
        <TableCell className="text-right">
          {formatCurrency(Number(data?.totalAmount))}
        </TableCell>
      </TableRow>
    </>
  );
};

export default function StaticDataTable({
  data,
  returnEnabled,
}: {
  data: SalesOrder;
}) {
  const { id } = useParams();
  const [toggle, handleToggle] = useToggle({ returnExchangeModal: false });
  const [returns, setReturns] = React.useState<ReturnItem[]>();
  const [returnItems, setReturnItems] = React.useState<ReturnItem[]>([]);
  const [hasReturnItems, setHasReturnItems] = React.useState<boolean>(false);
  const [returnTransactions, setReturnTransactions] =
    React.useState<ReturnTransaction | null>(null);
  React.useEffect(() => {
    const getReturns = async () => {
      try {
        const returns = await inventoryServices.getReturnTransaction(
          Number(id),
        );
        if (returns) {
          setReturnTransactions(returns);
          setHasReturnItems(true);

          const returnItems = await Promise.all(
            returns.map(async (i) => {
              const returnItems = await inventoryServices.getReturnItems(i.id);
              return returnItems;
            }),
          );
          console.log(returnItems);

          setReturnItems(returnItems.flat());
        }
      } catch (error) {
        console.log(error);
      }
    };

    getReturns();
  }, [id]);

  const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
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
            },
          ]
        : []),
      {
        accessorKey: "nameSnapshot",
        header: "Product",
        meta: {
          className: GLOBAL_COLOR.PRODUCT,
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

  const returnTransactionsColumns = React.useMemo(
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
              {String(row.original.combination.unit)}
            </ColorBadge>
          );
        },
      },
      {
        header: "Note",
        accessorKey: "discountNote",
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
  return (
    <>
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
        <Button
          type="button"
          onClick={() => handleToggle({ returnExchangeModal: true })}
        >
          Returns/Exchange
        </Button>
      )}
      {hasReturnItems && (
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
      {toggle.returnExchangeModal && (
        <ReturnExchangeModal
          onClose={() => handleToggle({ returnExchangeModal: false })}
          returns={returns}
          referenceId={Number(data.id)}
          salesOrder
        />
      )}
    </>
  );
}
