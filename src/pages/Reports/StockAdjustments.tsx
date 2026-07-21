import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  STOCK_ADJUSTMENT_TYPE_COLOR,
  UNIT_COLOR,
} from "@/utils/definitions";
import { useStockAdjustments } from "@/features/inventory/hooks/useInventory";
import { filterProps, StockAdjustment } from "@/schemas";
import { formatDateTime } from "@/utils/formatters";
import { Camera, Loader, Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tooltip from "@/components/Tooltip";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function StockAdjustments() {
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
    q: "",
  });
  const { data = PAGINATION_RESPONSE, isLoading } = useStockAdjustments(filter);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns = React.useMemo<ColumnDef<StockAdjustment>[]>(
    () => [
      {
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="combination.product.name"
            >
              Product
            </ColumnSort>
          );
        },
        accessorKey: "combination.product.name",
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary"
              to={`${ROUTES.PRODUCTS}/${row.original.combination?.productId}`}
            >
              {row.original.combination?.name}
            </Link>
          );
        },
      },
      {
        header: "Unit",
        accessorKey: "combination.product.unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.combination?.unit)}
            </ColorBadge>
          );
        },
      },
      {
        accessorKey: "reason",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Reason
            </ColumnSort>
          );
        },
        meta: {
          headerClassName: "text-center",
          className: "text-center",
        },
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={STOCK_ADJUSTMENT_TYPE_COLOR}>
              {String(row.original.reason)}
            </ColorBadge>
          );
        },
      },
      {
        accessorKey: "systemQuantity",
        header: "Original",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.systemQuantity);
        },
      },
      {
        accessorKey: "newQuantity",
        header: "New",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.newQuantity);
        },
      },

      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Date
            </ColumnSort>
          );
        },
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => {
          return formatDateTime(String(row.original.createdAt));
        },
      },
      {
        header: "User",
        accessorKey: "user.username",
      },
      {
        accessorKey: "notes",
        header: "Notes",
        meta: {
          headerClassName: "w-[100px]",
          className: "w-0 text-ellipsis w-[100px] truncate max-w-40",
        },
        cell: ({ row }) => {
          const note = row.original.notes || "";
          return <Tooltip content={note}>{note}</Tooltip>;
        },
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    <>
      <PageHeader title="Stock Adjustments" />
      <>
        <Input
          placeholder="Search Product"
          className="w-full"
          value={filter.q}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              q: e.target.value,
              page: 1,
            }));
          }}
        />
        {isLoading && <Loader />}
        <DataTable data={data.data} columns={columns} />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </>
    </>
  );
}
