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
import { usePriceHistory } from "@/features/inventory/hooks/useInventory";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { filterProps, PriceHistory } from "@/schemas";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function PriceHistoryPage() {
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "changedAt",
    order: "DESC",
    q: "",
  });
  const { data = PAGINATION_RESPONSE, isLoading } = usePriceHistory(filter);

  // const getData = React.useCallback(async () => {
  //   const data = await inventoryServices.getPriceHistory(filter);
  //   setData(data);
  // }, [filter]);

  // React.useEffect(() => {
  //   getData();
  // }, [getData]);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns = React.useMemo<ColumnDef<PriceHistory>[]>(
    () => [
      {
        accessorKey: "combinations.name",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="combinations.name"
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
        accessorKey: "changedAt",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Created
            </ColumnSort>
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
    [filter, handleFilterChange],
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
            placeholder="Search Product"
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
        {isLoading ? (
          <Loader />
        ) : (
          <DataTable
            data={data.data || []}
            columns={columns}
            meta={{
              disabledRow: {
                "combinations.deletedAt": true,
              },
            }}
          />
        )}
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
