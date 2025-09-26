import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Product, ProductCombinations } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { cx } from "class-variance-authority";
import { Link } from "react-router";
import React from "react";

export default function ProductItem({ item }: { item: Product }) {
  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => {
          return (
            <>
              <Link to={`${ROUTES.PRODUCTS}/${item.id}`}>{item.name}</Link>
              {item.sku && (
                <span className="text-xs text-muted-foreground">
                  ({item.sku})
                </span>
              )}
            </>
          );
        },
        meta: {
          headerClassName: cx("flex items-center gap-2", GLOBAL_COLOR.PRODUCT),
        },
      },
      // ...(item.variants?.map((variant, idx) => ({
      //   accessorKey: "values.values." + variant.name,
      //   header: variant.name,
      //   meta: {
      //     headerClassName: "h-0",
      //     className: "w-20",
      //   },
      //   cell: ({ row }: { row: Row<ProductCombinations> }) => {
      //     const x = row.original.values.findIndex(
      //       (i) => i.variantTypeId === item.variants?.[idx].id,
      //     );

      //     return row.original.values[x]?.value;
      //   },
      // })) || []),

      {
        accessorKey: "price",
        header: "Price",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return formatCurrency(row.original.price);
        },
      },

      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
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
    [item.variants],
  );

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* <div className="flex gap-2 items-center">
        <div className="ml-auto flex gap-2 items-center">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="size-8 shadow-sm"
          >
            <Link to={`${ROUTES.PRODUCTS}/${item.id}`}>
              <Pencil />
            </Link>
          </Button>
        </div>
      </div> */}
      <DataTable
        data={item.combinations || []}
        columns={columns}
        showFooter={false}
        emptyText="No combinations found"
        meta={{ disabledRow: "isActive" }}
      />
    </div>
  );
}
