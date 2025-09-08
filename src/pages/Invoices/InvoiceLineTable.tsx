import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/DataTable";
import { STATUS_COLOR } from "@/utils/definitions";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { GoodReceipt } from "@/types";
import React from "react";

export default function InvoiceLineTable({
  data = [],
  form,
}: {
  data: GoodReceipt[];
  form?: any;
}) {
  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "referenceNo",
        header: "Reference",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <ColorBadge colorMap={STATUS_COLOR}>{String(status)}</ColorBadge>
          );
        },
      },

      {
        header: "Receipt Date",
        accessorKey: "receiptDate",
        cell: ({ row }) => formatDate(row.getValue("receiptDate")),
      },

      {
        accessorKey: "totalAmount",
        header: () => "Total Amount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
      },
    ],
    [],
  );
  return (
    <DataTable
      data={data}
      columns={columns}
      //   errors={form?.formState?.errors}
      showFooter
      renderFooter={(rows: GoodReceipt[]) => {
        return (
          <TableRow className="font-bold">
            <TableCell colSpan={3}>Total Amount</TableCell>
            <TableCell className="text-right">
              {formatCurrency(
                rows?.reduce(
                  (acc: number, item: GoodReceipt) =>
                    acc + parseFloat(item.totalAmount ?? "0"),
                  0,
                ),
              )}
            </TableCell>
          </TableRow>
        );
      }}
    />
  );
}
