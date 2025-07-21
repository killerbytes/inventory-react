import { PurchaseOrder, type PurchaseOrderItem } from "@/services";
import { FieldArrayWithId, FieldErrors } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { cx } from "class-variance-authority";

type TableProps = {
  data: PurchaseOrderItem[];
  columns: ColumnDef<FieldArrayWithId<PurchaseOrderItem>>[];
  defaultColumn?: Partial<ColumnDef<FieldArrayWithId<PurchaseOrderItem>>>;
  meta?: object;
  errors: FieldErrors<PurchaseOrder>;
};

export default function Table({
  data,
  columns,
  defaultColumn,
  meta,
  errors,
}: TableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      defaultColumn={defaultColumn}
      meta={meta}
      tableClassname={cx({
        "border-red-500": errors.purchaseOrderItems,
      })}
      footer={
        <>
          <TableRow>
            {meta?.updateData && <TableCell></TableCell>}
            <TableCell colSpan={3}>Total Amount</TableCell>
            <TableCell className="text-right">
              {formatCurrency(
                data.reduce(
                  (acc: number, item: PurchaseOrderItem) =>
                    acc + item.unitPrice * item.quantity,
                  0,
                ),
              )}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(
                data.reduce(
                  (acc: number, item: PurchaseOrderItem) =>
                    acc + parseFloat(item.discount?.toString() ?? "0"),
                  0,
                ),
              )}
            </TableCell>
            <TableCell className="text-right"></TableCell>
            <TableCell className="text-right">
              {formatCurrency(
                data.reduce(
                  (acc: number, item: PurchaseOrderItem) =>
                    acc +
                    item.unitPrice * item.quantity -
                    parseFloat(item.discount?.toString() ?? "0"),
                  0,
                ),
              )}
            </TableCell>
          </TableRow>
        </>
      }
    />
  );
}
