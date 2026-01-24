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
import { filterProps, PaginatedResponse, ProductCombinations } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { formatDate } from "@/utils/formatters";
import { inventoryServices } from "@/services";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

type Props = {
  name: string;
  combinations: ProductCombinations;
  lastSoldAt: string;
  quantity: number;
};

export default function Reorders() {
  const [data, setData] =
    React.useState<PaginatedResponse<Props[]>>(PAGINATION_RESPONSE);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "lastSoldAt",
    order: "DESC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getReorderLevels(filter);
    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    const { sort } = data;

    setFilter((prevState) => ({
      ...prevState,
      ...data,
      sort: last(sort?.split("_")),
    }));
  }, []);

  const columns = React.useMemo<ColumnDef<Props>[]>(
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
              className="flex gap-2 items-center"
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
          return Number(row.original.quantity);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Reorder Levels
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <DataTable
          data={data.data || []}
          columns={columns}
          meta={{ disabledRow: "combinations.isActive" }}
        />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
