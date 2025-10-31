import { GLOBAL_COLOR, UNIT_COLOR } from "@/utils/definitions";
import { TableCell, TableRow } from "@/components/ui/table";
import { SalesOrder, SalesOrderItem } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import React from "react";

const renderFooter = (data: SalesOrder) => {
  return (
    <>
      <TableRow>
        <TableCell colSpan={7}>Total Amount</TableCell>
        <TableCell className="text-right">
          {formatCurrency(Number(data?.totalAmount))}
        </TableCell>
      </TableRow>
    </>
  );
};

export default function StaticDataTable({ data }: { data: SalesOrder }) {
  const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
    () => [
      {
        accessorKey: "nameSnapshot",
        header: "Product",
        meta: {
          className: GLOBAL_COLOR.PRODUCT,
        },
      },
      {
        accessorKey: "variantSnapshot",
        header: "Variant",
        cell: ({ row }) => {
          const variantSnapshot = row.original.variantSnapshot;
          return Object.keys(variantSnapshot)
            .map((key) => `${key}: ${variantSnapshot[key]}`)
            .join(" | ");
        },
      },
      {
        header: "Price",
        accessorKey: "purchasePrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.purchasePrice);
        },
      },
      {
        header: () => "Quantity",
        accessorKey: "quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.unit)}
            </ColorBadge>
          );
        },
      },
      {
        header: () => <div className="text-right">Discount</div>,
        accessorKey: "discount",
        meta: {
          className: "text-right",
        },
      },
      {
        header: "Note",
        accessorKey: "discountNote",
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.original.totalAmount ?? 0),
      },
    ],
    [],
  );
  return (
    <DataTable
      data={data.salesOrderItems || []}
      columns={columns}
      renderFooter={() => renderFooter(data)}
      showFooter
    />
  );
}
