import {
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
  INVENTORY_MOVEMENT_TYPE_COLOR,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { ColumnDef } from "@tanstack/react-table";
import { InventoryMovement } from "@/types";
import { DataTable } from "./DataTable";
import ColorBadge from "./ColorBadge";
import { Link } from "react-router";
import React from "react";

export default function Movements({ data }: { data: InventoryMovement[] }) {
  const columns = React.useMemo<ColumnDef<InventoryMovement>[]>(
    () => [
      {
        header: "Product",
        accessorKey: "combination.product.name",
        cell: ({ row }) => {
          return (
            <Link
              className="flex gap-2 items-center"
              to={`${ROUTES.PRODUCTS}/${row.original.combination?.productId}`}
            >
              {row.original.combination?.name}
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(row.original.combination?.unit)}
              </ColorBadge>
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
            <Link
              to={`${ROUTES.GOOD_RECEIPT}/${row.original.reference}`}
              className="text-primary"
            >
              <ColorBadge colorMap={INVENTORY_MOVEMENT_TYPE_COLOR}>
                {String(row.original.type)}
              </ColorBadge>
            </Link>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        accessorKey: "costPerUnit",
        header: "Cost Per Unit",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.costPerUnit);
        },
      },
      {
        accessorKey: "totalCost",
        header: "Total Cost",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.totalCost);
        },
      },
      {
        accessorKey: "referenceId",
        header: "Reference",
        cell: ({ row }) => {
          let route;
          switch (row.original.referenceType) {
            case INVENTORY_MOVEMENT_REFERENCE_TYPE.GOOD_RECEIPT:
              route = ROUTES.GOOD_RECEIPT;

              break;
            case INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER:
              route = ROUTES.SALES_ORDERS;
              break;
            case INVENTORY_MOVEMENT_REFERENCE_TYPE.STOCK_ADJUSTMENT:
              // route = ROUTES.GOOD_RECEIPT;
              break;
            default:
            // route = ROUTES.GOOD_RECEIPT;
          }
          return (
            route && (
              <Link
                to={`${route}/${row.original.referenceId}`}
                className="text-primary"
              >
                {row.original.referenceType}:{row.original.referenceId}
              </Link>
            )
          );
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
    <>
      <DataTable data={data} columns={columns} showFooter={false} />
    </>
  );
}
