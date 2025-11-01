import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { filterProps, PaginatedResponse, priceHistory } from "@/types";
import { PAGINATION, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function PriceHistory() {
  const [data, setData] = React.useState<PaginatedResponse<priceHistory[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "createdAt",
    order: "DESC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    console.log(filter);
    const data = await inventoryServices.getPriceHistory(filter);
    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const onFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns = React.useMemo<ColumnDef<priceHistory>[]>(
    () => [
      {
        accessorKey: "combinations.name",
        header: "Name",
        meta: {},
        cell: ({ row }) => {
          const { combinations } = row.original;

          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${combinations?.productId}`}
              className="flex gap-2 items-center"
            >
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(combinations?.unit)}
              </ColorBadge>
              {combinations?.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "fromPrice",
        header: "From",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { fromPrice } = row.original;
          return formatCurrency(fromPrice);
        },
      },
      {
        accessorKey: "toPrice",
        header: "To",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { fromPrice, toPrice } = row.original;
          const positive =
            parseFloat(String(fromPrice)) > parseFloat(String(toPrice));
          return (
            <div
              className={cx("flex items-center justify-end gap-1", {
                "text-red-500": positive,
                "text-green-500": !positive,
              })}
            >
              {formatCurrency(toPrice)}
            </div>
          );
        },
      },

      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                onFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              Created
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp size={16} />
              ) : (
                filter.sort === column.id && <ChevronDown size={16} />
              )}
            </span>
          );
        },
        cell: ({ row }) => {
          return formatDateTime(String(row.original.changedAt));
        },
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          return row.original.user?.username;
        },
      },
    ],
    [filter.order, filter.sort, onFilterChange],
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Price History
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <div>
          <Input
            placeholder="Search invoice"
            className="w-full mb-4"
            value={filter.q}
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                q: e.target.value,
                page: 1,
              }));
            }}
          />
        </div>
        <DataTable data={data.data || []} columns={columns} />
        <Pager data={data} filter={filter} setFilter={setFilter} />
      </CardContent>
    </Card>
  );
}
