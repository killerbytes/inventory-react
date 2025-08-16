import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { getMappedProductComboName } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Product, ProductCombinations } from "@/types";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Pencil } from "lucide-react";
import { Link } from "react-router";
import React from "react";

export default function ProductItem({ item }: { item: Product }) {
  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        header: "Product",
        cell: ({ row }) => {
          return getMappedProductComboName(item, row.original.values);
        },
      },

      {
        accessorKey: "price",
        header: "Price",
        meta: {
          headerClassName: "h-0",
        },
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "h-0",
        },
      },
      {
        header: "Re-order Level",
        accessorKey: "reorderLevel",
        meta: {
          headerClassName: "h-0",
        },
      },
      ...(item.variants?.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        meta: {
          headerClassName: "h-0",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return row.original.values[idx]?.value;
        },
      })) || []),
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex gap-2 items-center">
        <div className="">
          <div className="flex gap-2 items-center">
            <div className={cx("font-semibold", GLOBAL_COLOR.PRODUCT)}>
              {item.name}
            </div>
          </div>
          {item.description && (
            <div className="text-xs text-gray-500">{item.description}</div>
          )}
        </div>
        <div className="ml-auto flex gap-2 items-center">
          <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="size-8 shadow-sm"
          >
            <Link to={`${ROUTES.PRODUCTS}/${item.id}/edit`}>
              <Pencil />
            </Link>
          </Button>
        </div>
      </div>
      <DataTable
        data={item.combinations || []}
        columns={columns}
        showFooter={false}
        emptyText="No combinations found"
      />
    </div>
  );
}
