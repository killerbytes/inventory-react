import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { useReorderLevels } from "@/features/inventory/hooks/useInventory";
import { Reorder } from "@/schemas/reports.schema";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { formatDate } from "@/utils/formatters";
import { cx } from "class-variance-authority";
import { filterProps } from "@/schemas";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

export default function Reorders() {
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "lastSoldAt",
    order: "DESC",
    q: "",
  });

  const { data = PAGINATION_RESPONSE } = useReorderLevels(filter);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    const { sort } = data;

    setFilter((prevState) => ({
      ...prevState,
      ...data,
      sort: last(sort?.split("_")),
    }));
  }, []);

  const columns = React.useMemo<ColumnDef<Reorder>[]>(
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
        meta: {},
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
        accessorKey: "combinations.reorderLevel",
        header: ({ column }) => (
          <ColumnSort
            filter={filter}
            handleFilterChange={handleFilterChange}
            column={column}
            align="right"
          >
            Reorder Level
          </ColumnSort>
        ),
        meta: {
          className: "text-right",
        },
      },
      {
        accessorKey: "transactionCount",
        header: ({ column }) => (
          <ColumnSort
            filter={filter}
            handleFilterChange={handleFilterChange}
            column={column}
            align="right"
          >
            Transactions
          </ColumnSort>
        ),
        meta: {
          className: "text-right",
        },
      },
      {
        accessorKey: "combinations.inventory.quantity",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              align="right"
            >
              Quantity
            </ColumnSort>
          );
        },
        meta: {
          className: "text-right",
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
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              align="right"
            >
              Date
            </ColumnSort>
          );
        },
        meta: {
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatDate(row.original.lastSoldAt);
        },
      },
    ],
    [filter, handleFilterChange],
  );
  return (
    <>
      <PageHeader title="Reorder Levels" />
      <>
        <DataTable
          data={data.data || []}
          columns={columns}
          meta={{ disabledRow: { "combinations.isActive": false } }}
        />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </>
    </>
  );
}
