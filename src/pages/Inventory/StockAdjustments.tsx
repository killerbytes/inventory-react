import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/PageHeader";
import { InventoryMovement, PaginatedResponse, StockAdjustment } from "@/types";
import { ROUTES, STOCK_ADJUSTMENT_TYPE_COLOR } from "@/utils/definitions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { Link } from "react-router";
import React from "react";

export default function StockAdjustments() {
  const [data, setData] = React.useState<PaginatedResponse<InventoryMovement>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const getData = async () => {
    const data = await inventoryServices.getStockAdjustments({});
    setData(data);
  };

  React.useEffect(() => {
    getData();
  }, []);

  const columns = React.useMemo<ColumnDef<StockAdjustment>[]>(
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
        accessorKey: "reason",
        header: "Type",
        meta: {
          headerClassName: "text-center",
          className: "text-center",
        },
        cell: ({ row }) => {
          return (
            <Link to={`${ROUTES.PURCHASE_ORDERS}/${row.original.reference}`}>
              <ColorBadge colorMap={STOCK_ADJUSTMENT_TYPE_COLOR}>
                {String(row.original.reason)}
              </ColorBadge>
            </Link>
          );
        },
      },
      {
        accessorKey: "systemQuantity",
        header: "Original Inventory",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
      },
      {
        accessorKey: "newQuantity",
        header: "New Inventory",
        meta: {
          headerClassName: "text-right",
          className: "text-right w-0",
        },
      },

      {
        accessorKey: "notes",
        header: "Notes",
        meta: {
          className: "w",
        },
      },
      {
        accessorKey: "createdAt",
        header: "Updated At",
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
    ],
    [],
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
        <CardContent>
          <DataTable data={data.data} columns={columns} showFooter={false} />
        </CardContent>
      </Card>
    </>
  );
}
