import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { PurchaseOrder, PurchaseOrderItem } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { FieldErrors } from "react-hook-form";
import AmountColumn from "./AmountColumn";
import UnitColumn from "./UnitColumn";
import { Plus } from "lucide-react";

type TableProps = {
  data: PurchaseOrderItem[];
  columns: ColumnDef<PurchaseOrderItem, unknown>[];
  renderFooter?: (
    data: PurchaseOrderItem[],
    append: () => void,
  ) => React.ReactNode;
  errors: FieldErrors<PurchaseOrder>;
  append?: () => void;
};

function defaultRenderFooter(data: PurchaseOrderItem[], append: () => void) {
  const total = data.reduce(
    (acc, item) => {
      return {
        amount: acc.amount + (item.purchasePrice || 0) * (item.quantity || 0),
        purchasePrice: acc.purchasePrice + (Number(item.purchasePrice) || 0),
        discount: acc.discount + (item.discount || 0),
      };
    },
    {
      amount: 0,
      discount: 0,
      purchasePrice: 0,
    },
  );
  return (
    <TableFooter>
      {append && (
        <TableRow>
          <TableCell colSpan={8}>
            <Button
              type="button"
              variant="outline"
              className="shadow-sm"
              onClick={append}
            >
              <Plus />
            </Button>
          </TableCell>
        </TableRow>
      )}
      <TableRow>
        <TableCell colSpan={2}>Total</TableCell>
        <TableCell className="text-right">
          {formatCurrency(total?.purchasePrice)}
        </TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right ">
          {total?.discount ? formatCurrency(total?.discount) : "-"}
        </TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right">
          {formatCurrency(total?.amount - total?.discount)}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}

export default function PurchaseOrderItemForm({
  data,
  columns,
  renderFooter = defaultRenderFooter,
  errors,
  append,
}: TableProps) {
  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        tableClassname={cx({
          "border-red-500": errors.purchaseOrderItems,
        })}
        renderFooter={() => renderFooter(data, append)}
      />
    </>
  );
}

export { AmountColumn, UnitColumn };
