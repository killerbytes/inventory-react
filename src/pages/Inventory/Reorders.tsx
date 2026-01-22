import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { filterProps, PaginatedResponse, ProductCombinations } from "@/types";
import { PAGINATION, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
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
  const [data, setData] = React.useState<PaginatedResponse<Props[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
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
        header: "Name",
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
        header: "Reorder Level",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
      },
      {
        accessorKey: "combinations.inventory.quantity",
        header: ({ column }) => {
          const columnId = last(column.id.split("_"));
          return (
            <span
              className="flex items-center gap-2 cursor-pointer justify-end"
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: columnId,
                });
              }}
            >
              Quantity
              {filter.sort === columnId && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === columnId && <ChevronDown />
              )}
            </span>
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
            <span
              className="flex items-center gap-2 cursor-pointer justify-end"
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              Date
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === column.id && <ChevronDown />
              )}
            </span>
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
    [filter.order, filter.sort, handleFilterChange],
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
        <Pager data={data} filter={filter} setFilter={setFilter} />
      </CardContent>
    </Card>
  );
}
