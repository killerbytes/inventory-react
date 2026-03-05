import { ProductCombination, ProductWithCombinations } from "@/schemas";
import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { cx } from "class-variance-authority";
import { Link } from "react-router";
import React from "react";

export default function ProductItem({
  item,
}: {
  item: ProductWithCombinations;
}) {
  const columns = React.useMemo<ColumnDef<ProductCombination>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => {
          return (
            <>
              <Link
                to={`${ROUTES.PRODUCTS}/${item.id}`}
                className={GLOBAL_COLOR.PRODUCT}
              >
                {item.name}
              </Link>
              {item.sku && (
                <span className="text-xs text-muted-foreground">
                  ({item.sku})
                </span>
              )}
            </>
          );
        },
        meta: {
          headerClassName: cx("flex items-center gap-2"),
        },
      },

      {
        accessorKey: "price",
        header: "Price",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return formatCurrency(row.original.price ?? 0);
        },
      },

      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return Number(row.original.inventory?.quantity);
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          );
        },
      },
      {
        header: "Re-order",
        accessorKey: "reorderLevel",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
      },
    ],
    [item.id, item.name, item.sku],
  );

  return (
    <div className="flex flex-col gap-2 py-2">
      <DataTable
        data={item.combinations || []}
        columns={columns}
        meta={{
          disabledRow: { isActive: false },
          emptyText: "No combinations found",
        }}
      />
    </div>
  );
}
