import { PurchaseOrder, type PurchaseOrderItem } from "@/services";
import { Control, FieldErrors, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { cx } from "class-variance-authority";
import Amount from "./Amount";
import Unit from "./Unit";

type TableProps = {
  control: Control<PurchaseOrder>;
  data: PurchaseOrderItem[];
  columns: ColumnDef<PurchaseOrderItem, unknown>[];
  errors: FieldErrors<PurchaseOrder>;
};

export default function Table({ control, data, columns, errors }: TableProps) {
  const fields = useWatch({
    control,
    name: "purchaseOrderItems",
  });

  const total = fields?.reduce(
    (
      acc: { amount: number; unitPrice: number; discount: number },
      item: PurchaseOrderItem,
    ) => {
      const unitPrice = Number(item.unitPrice);
      const discount = Number(item.discount);

      return {
        amount: acc.amount + (unitPrice || 0) * (item.quantity || 0),
        unitPrice: acc.unitPrice + (unitPrice || 0),
        discount: acc.discount + (discount || 0),
      };
    },
    {
      amount: 0,
      discount: 0,
      unitPrice: 0,
    },
  );

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        tableClassname={cx({
          "border-red-500": errors.purchaseOrderItems,
        })}
        footer={
          <>
            <TableRow>
              <TableCell colSpan={columns.length === 8 ? 2 : 1}>
                Total
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(total?.amount)}
              </TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right ">
                {formatCurrency(total?.discount)}
              </TableCell>
              <TableCell className="text-right"></TableCell>
              <TableCell className="text-right">
                {formatCurrency(total?.amount - total?.discount)}
              </TableCell>
            </TableRow>
          </>
        }
      />
    </>
  );
}

export { Table, Unit, Amount };
