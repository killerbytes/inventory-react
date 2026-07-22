import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { useNoSales } from "@/features/inventory/hooks/useInventory";
import { NoSales } from "@/schemas/reports.schema";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { filterProps } from "@/schemas";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

export default function DeadStock() {
  const [filter, setFilter] = React.useState<filterProps>({
    limit: 5,
    page: PAGINATION.PAGE,
    sort: "quantity",
  });

  const { data = PAGINATION_RESPONSE, isLoading } = useNoSales(filter);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    const { sort } = data;

    setFilter((prevState) => ({
      ...prevState,
      ...data,
      sort: last(sort?.split("_")),
    }));
  }, []);
  const columns = React.useMemo<ColumnDef<NoSales>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Name
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${row.original.productId}`}
              className="flex gap-2 items-center text-primary"
            >
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(row.original.unit)}
              </ColorBadge>
              {row.original.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "inventory.quantity",
        meta: {
          className: "text-right",
        },
        header: ({ column }) => {
          return (
            <ColumnSort
              align="right"
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Quantity
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          return Number(row.original.inventory.quantity);
        },
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">Dead Stock</h1>
      <DataTable
        data={data.data || []}
        columns={columns}
        meta={{ disabledRow: { isActive: false } }}
      />
    </div>
  );
}
