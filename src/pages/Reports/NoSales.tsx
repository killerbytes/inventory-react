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
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import Loader from "@/components/Loader";
import { filterProps } from "@/schemas";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

export default function NoSalesPage() {
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
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
    <>
      <PageHeader title="No Sales" />
      <>
        {isLoading && <Loader />}
        <DataTable
          data={data.data || []}
          columns={columns}
          meta={{ disabledRow: { isActive: false } }}
        />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </>
    </>
  );
}
