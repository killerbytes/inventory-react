import { FieldArrayWithId, FieldErrors, UseFormReturn } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { type PurchaseOrderItem } from "@/services";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { cx } from "class-variance-authority";

type TableProps = {
  data: PurchaseOrderItem[];
  columns: ColumnDef<FieldArrayWithId<PurchaseOrderItem>>[];
  defaultColumn: Partial<ColumnDef<FieldArrayWithId<PurchaseOrderItem>>>;
  meta: object;
  form: UseFormReturn<T>;
  errors: FieldErrors<T>;
};

export default function Table({
  data,
  columns,
  defaultColumn,
  meta,
  form,
  errors,
}: TableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      defaultColumn={defaultColumn}
      meta={meta}
      onUpdate={(data: PurchaseOrderItem[]) => {
        form.setValue("purchaseOrderItems", data);
      }}
      tableClassname={cx({
        "border-red-500": errors.purchaseOrderItems,
      })}
      footer={
        <>
          <TableRow>
            <TableCell></TableCell>
            <TableCell colSpan={2}>Total Amount</TableCell>
            <TableCell className="text-right">
              {formatCurrency(
                data.reduce(
                  (acc: number, item: PurchaseOrderItem) =>
                    acc + item.unitPrice * item.quantity,
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
