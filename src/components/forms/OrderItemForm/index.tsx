import { Control, FieldValues, Path, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AmountColumn from "./AmountColumn";
import UnitColumn from "./UnitColumn";
import { Plus } from "lucide-react";

type FooterValuesProps = {
  purchasePrice: number;
  quantity: number;
  discount: number;
};

type TableProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  fields: T[];
  columns: ColumnDef<T, unknown>[];
  renderFooter?: (
    data: FooterValuesProps[],
    append: () => void,
  ) => React.ReactNode;
  append?: () => void;
};

function defaultRenderFooter(data: FooterValuesProps[], append: () => void) {
  const total = data?.reduce(
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
    <>
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
        <TableCell className="text-right px-5">
          {formatCurrency(total?.purchasePrice)}
        </TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right px-5 ">
          {total?.discount ? formatCurrency(total?.discount) : "-"}
        </TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right">
          {formatCurrency(total?.amount - total?.discount)}
        </TableCell>
      </TableRow>
    </>
  );
}

export default function PurchaseOrderItemForm<T extends FieldValues>({
  name,
  control,
  fields,
  columns,
  renderFooter = defaultRenderFooter,
  append,
}: TableProps<T>) {
  const footerValues = useWatch({ control, name });

  return (
    <>
      <DataTable
        data={fields}
        columns={columns}
        // tableClassname={cx({
        //   "border-red-500": errors.purchaseOrderItems,
        // })}
        renderFooter={() => renderFooter(footerValues, append ?? (() => {}))}
      />
    </>
  );
}

export { AmountColumn, UnitColumn };
