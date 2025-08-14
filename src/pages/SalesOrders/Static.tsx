import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { SalesOrder, SalesOrderItem } from "@/types";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import UnitBadge from "@/components/UnitBadge";
import { Label } from "@/components/ui/label";
import React from "react";

const renderFooter = (data: SalesOrder) => {
  return (
    <>
      <TableRow>
        <TableCell colSpan={8}>Total Amount</TableCell>
        <TableCell className="text-right">
          {formatCurrency(Number(data?.totalAmount))}
        </TableCell>
      </TableRow>
    </>
  );
};

export default function Static({ data }) {
  const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
    () => [
      {
        accessorKey: "nameSnapshot",
        header: "Product",
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
        header: "Original Price",
        accessorKey: "originalPrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.originalPrice ?? 0);
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
      },
      {
        header: "Unit",
        accessorKey: "unit",
        cell: ({ row }) => {
          return <UnitBadge>{String(row.original.unit)}</UnitBadge>;
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
    <>
      <div className="flex flex-col gap-4">
        <Label htmlFor="terms">Sales Order Number</Label>
        <div className="font-semibold text-sm">
          SO# {data?.salesOrderNumber}
        </div>
        <Label htmlFor="terms">Customer</Label>
        <div className="font-semibold text-sm">{data?.customer?.name}</div>
        <Label htmlFor="terms">Order Date</Label>
        <div className="font-semibold text-sm">
          {data?.orderDate ? data?.orderDate : "-"}
        </div>
        <Label htmlFor="terms">Delivery Date</Label>
        <div className="font-semibold text-sm">
          {data?.deliveryDate ? formatDate(data?.deliveryDate) : "-"}
        </div>
        <Label htmlFor="terms">Mode of Payment</Label>
        <div className="font-semibold text-sm">{data?.modeOfPayment}</div>
        <Label htmlFor="terms">Notes</Label>
        <div className="font-semibold text-sm">{data?.notes}</div>
        <Label htmlFor="terms">Internal Notes</Label>
        <div className="font-semibold text-sm">{data?.internalNotes}</div>

        <DataTable
          data={data?.salesOrderItems}
          columns={columns}
          renderFooter={() => renderFooter(data)}
        />
      </div>
    </>
  );
}
