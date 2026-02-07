import { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";
import ReturnExchangeModal from "@/components/modals/ReturnExchangeModal";
import { ReturnItem, SalesOrder, SalesOrderItem } from "@/types";
import { GLOBAL_COLOR, UNIT_COLOR } from "@/utils/definitions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import useToggle from "@/hooks/useToggle";
import { Link } from "react-router";
import { useStore } from "@/stores";
import React from "react";

const renderFooter = (data: SalesOrder) => {
  return (
    <>
      <TableRow>
        <TableCell colSpan={10} className="text-right font-semibold ">
          {formatCurrency(Number(data?.totalAmount))}
        </TableCell>
      </TableRow>
    </>
  );
};

export default function StaticDataTable({ data }: { data: SalesOrder }) {
  const [toggle, handleToggle] = useToggle({ returnExchangeModal: false });
  const [returns, setReturns] = React.useState<ReturnItem[]>();
  const {
    salesOrderState: { returnEnabled, setReturnEnabled },
  } = useStore();

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
                  onCheckedChange={(value) => {
                    console.log(value);

                    table.toggleAllPageRowsSelected(!!value);
                  }}
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
        accessorKey: "index",
        header: "#",
        size: 20,
        cell: ({ row }) => {
          return row.index + 1;
        },
      },

      {
        header: () => "Quantity",
        accessorKey: "quantity",
        size: 80,
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
        size: 20,
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
          className: cx("w-1/2", GLOBAL_COLOR.PRODUCT),
        },
        cell: ({ row }) => {
          return (
            <Link
              className={GLOBAL_COLOR.PRODUCT}
              to={`/products/${row.original.combinations?.productId}`}
            >
              {row.original.nameSnapshot}
            </Link>
          );
        },
      },
      // {
      //   accessorKey: "variantSnapshot",
      //   header: "Variant",
      //   cell: ({ row }) => {
      //     const variantSnapshot = row.original.variantSnapshot;
      //     return Object.keys(variantSnapshot)
      //       .map((key) => `${key}: ${variantSnapshot[key]}`)
      //       .join(" | ");
      //   },
      // },

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

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        data={data.salesOrderItems || []}
        columns={columns}
        renderFooter={() => renderFooter(data)}
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

      {toggle.returnExchangeModal && (
        <ReturnExchangeModal
          onClose={() => {
            handleToggle({ returnExchangeModal: false });
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
