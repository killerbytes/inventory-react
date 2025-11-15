import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { filterProps, PaginatedResponse, priceHistory } from "@/types";
import { PAGINATION, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function Reorders() {
  const [data, setData] = React.useState<PaginatedResponse<priceHistory[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "quantity",
    order: "ASC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getReorderLevels(filter);
    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const columns = React.useMemo<ColumnDef<priceHistory>[]>(
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
        header: "Stock",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
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
          Reorder Levels
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
