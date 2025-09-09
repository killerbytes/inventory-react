import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGINATION, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreakPack, PaginatedResponse } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import React from "react";

export default function BreakPacks() {
  const [data, setData] = React.useState<PaginatedResponse<BreakPack[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "createdAt",
    order: "ASC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getBreakPacks(filter);
    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleFilterChange = React.useCallback((data) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns = React.useMemo<ColumnDef<BreakPack>[]>(
    () => [
      {
        accessorKey: "fromCombination",
        header: "From",
        meta: {},
        cell: ({ row }) => {
          const { fromCombination } = row.original;

          return (
            <div className="flex gap-2 items-center">
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(fromCombination?.unit)}
              </ColorBadge>
              <Link to={`${ROUTES.PRODUCTS}/${fromCombination?.productId}`}>
                {fromCombination?.name}
              </Link>
            </div>
          );
        },
      },
      {
        accessorKey: "toCombination",
        header: "To",
        meta: {},
        cell: ({ row }) => {
          const { toCombination } = row.original;

          return (
            <div className="flex gap-2 items-center">
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(toCombination?.unit)}
              </ColorBadge>
              {toCombination?.name}
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          className: "text-center",
        },
      },
      {
        accessorKey: "conversionFactor",
        header: "Conversion Factor",
        meta: {
          className: "text-center",
        },
      },

      {
        accessorKey: "Total",
        header: "Total",
        meta: {
          className: "text-center",
        },
        cell: ({ row }) => {
          return row.original.quantity * row.original.conversionFactor;
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              Created
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === column.id && <ChevronDown />
              )}
            </span>
          );
        },
        cell: ({ row }) => {
          return formatDateTime(String(row.original.createdAt));
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
    [filter.order, filter.sort, handleFilterChange],
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Break Packs
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
        <DataTable data={data?.data || []} columns={columns} />
      </CardContent>
    </Card>
  );
}
