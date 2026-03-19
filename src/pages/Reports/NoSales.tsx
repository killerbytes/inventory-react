import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { useNoSales } from "@/features/inventory/hooks/useInventory";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NoSales } from "@/schemas/reports.schema";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
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

  const { data = PAGINATION_RESPONSE, isLoading, error } = useNoSales(filter);

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
              className="flex gap-2 items-center"
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
        header: ({ column }) => {
          return (
            <ColumnSort
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          No Sales
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <DataTable
          data={data.data || []}
          columns={columns}
          meta={{ disabledRow: { isActive: false } }}
        />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
