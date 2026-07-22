import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { useReorderLevels } from "@/features/inventory/hooks/useInventory";
import { NoSales, Reorder } from "@/schemas/reports.schema";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { formatDate } from "@/utils/formatters";
import { cx } from "class-variance-authority";
import { filterProps } from "@/schemas";
import { Link } from "react-router";
import React from "react";

export default function LowStock() {
  const [filter] = React.useState<filterProps>({
    limit: 5,
    page: PAGINATION.PAGE,
    sort: "lastSoldAt",
    order: "DESC",
    q: "",
  });

  const { data = PAGINATION_RESPONSE } = useReorderLevels(filter);

  const columns = React.useMemo<ColumnDef<Reorder>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const { combinations } = row.original;
          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${combinations.productId}`}
              className="flex gap-2 items-center text-primary"
            >
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(combinations.unit)}
              </ColorBadge>
              {combinations.name}
            </Link>
          );
        },
      },

      {
        accessorKey: "combinations.inventory.quantity",
        header: "Quantity",
        meta: {
          className: "text-right",
          headerClassName: "text-right",
        },
        cell: ({ row }) => {
          return (
            <div
              className={cx({
                "font-bold text-red-500": row.original.quantity <= 0,
              })}
            >
              {Number(row.original.quantity)}
            </div>
          );
        },
      },
      {
        accessorKey: "lastSoldAt",
        header: "Date",
        meta: {
          className: "text-right",
          headerClassName: "text-right",
        },
        cell: ({ row }) => {
          return formatDate(row.original.lastSoldAt);
        },
      },
    ],
    [filter],
  );
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">Low Stock</h1>
      <DataTable
        data={data.data || []}
        columns={columns}
        meta={{ disabledRow: { isActive: false } }}
      />
    </div>
  );
}
