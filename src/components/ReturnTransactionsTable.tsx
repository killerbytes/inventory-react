import { formatCurrency, formatDate } from "@/utils/formatters";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell, TableRow } from "./ui/table";
import { ReturnTransaction } from "@/types";
import { DataTable } from "./DataTable";
import React from "react";

export default function ReturnTransactionsTable({
  data,
}: {
  data: ReturnTransaction[];
}) {
  const returnTransactionsColumns = React.useMemo<
    ColumnDef<ReturnTransaction>[]
  >(
    () => [
      {
        header: "Id",
        accessorKey: "id",
        meta: {
          headerClassName: "w-0",
        },
      },
      {
        header: "Date",
        accessorKey: "updatedAt",
        cell: ({ row }) => {
          return formatDate(row.original.updatedAt);
        },
      },
      {
        accessorKey: "totalReturnAmount",
        header: "Return Amount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.totalReturnAmount);
        },
      },
    ],
    [],
  );
  return (
    <DataTable
      data={data || []}
      columns={returnTransactionsColumns}
      showFooter
      renderFooter={(data) => {
        const total = data.reduce(
          (acc, item) => (acc += Number(item.totalReturnAmount)),
          0,
        );
        return (
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell colSpan={10} className="text-right font-bold">
              {formatCurrency(total)}
            </TableCell>
          </TableRow>
        );
      }}
    />
  );
}
