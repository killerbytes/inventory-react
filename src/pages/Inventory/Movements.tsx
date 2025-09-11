import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  INVENTORY_MOVEMENT_TYPE_COLOR,
  PAGINATION,
  ROUTES,
} from "@/utils/definitions";
import { InventoryMovement, PaginatedResponse } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function Movements() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedResponse<InventoryMovement>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [filter, setFilter] = React.useState({
    limit: 100, // PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
  });
  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getMovements(filter);
    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);

  const columns = React.useMemo<ColumnDef<InventoryMovement>[]>(
    () => [
      {
        header: "Product",
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
        accessorKey: "type",
        header: "Type",
        meta: {
          headerClassName: "text-center",
          className: "text-center",
        },
        cell: ({ row }) => {
          return (
            <Link to={`${ROUTES.GOOD_RECEIPT}/${row.original.reference}`}>
              <ColorBadge colorMap={INVENTORY_MOVEMENT_TYPE_COLOR}>
                {String(row.original.type)}
              </ColorBadge>
            </Link>
          );
        },
      },
      {
        accessorKey: "previous",
        header: "Initial",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
      },
      {
        accessorKey: "quantity",
        header: "Movement",
        meta: {
          headerClassName: "text-right",
          className: "text-right w-0",
        },
      },

      {
        accessorKey: "new", // "inventory.quantity",
        header: "Inventory",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        meta: {
          className: "w",
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => {
          return formatDateTime(String(row.original.updatedAt));
        },
      },
      {
        header: "User",
        accessorKey: "user.username",
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
          Inventory Movements
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <DataTable data={data.data} columns={columns} showFooter={false} />
        {data.totalPages > 1 && (
          <Pager data={data} page={page} setPage={setPage} />
        )}
      </CardContent>
    </Card>
  );
}
