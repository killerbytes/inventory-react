import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  STOCK_ADJUSTMENT_TYPE_COLOR,
  UNIT_COLOR,
} from "@/utils/definitions";
import {
  filterProps,
  InventoryMovement,
  PaginatedResponse,
  StockAdjustment,
} from "@/types";
import { PageHeader, PageHeaderTitle } from "@/components/PageHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function StockAdjustments() {
  const [data, setData] =
    React.useState<PaginatedResponse<InventoryMovement>>(PAGINATION_RESPONSE);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
    q: "",
  });
  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getStockAdjustments(filter);
    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [filter, getData]);

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
          className: "w-0 text-ellipsis w-[100px]",
        },
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    <>
      <PageHeader>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px] mr-2" />
          <div>
            <PageHeaderTitle>Stock Adjustment</PageHeaderTitle>
          </div>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="gap-4 flex flex-col">
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
          <DataTable data={data.data} columns={columns} showFooter={false} />
          {data.meta.totalPages > 1 && (
            <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
