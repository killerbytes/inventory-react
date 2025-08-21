import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreakPack, PaginatedResponse } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { inventoryServices } from "@/services";
import React from "react";

export default function BreakPacks() {
  const [data, setData] = React.useState<PaginatedResponse<BreakPack[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getBreakPacks({});
    setData(data);
  }, []);

  React.useEffect(() => {
    getData();
  }, [getData]);

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
                {String(fromCombination?.product?.unit)}
              </ColorBadge>

              {fromCombination?.name}
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
              {toCombination?.product?.name}{" "}
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(toCombination?.product?.unit)}
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
        header: "Created At",
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
    [],
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
        <DataTable data={data?.data || []} columns={columns} />
      </CardContent>
    </Card>
  );
}
