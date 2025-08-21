import { Control, FieldArrayWithId, Path, useWatch } from "react-hook-form";
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

type TableProps<T extends FieldArrayWithId, TColumns extends ColumnDef<T>> = {
  name: Path<T>;
  control: Control<T>;
  fields: T[];
  columns: TColumns[];
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
        discount: acc.discount + (Number(item.discount) || 0),
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

export default function PurchaseOrderItemForm<T>({
  name,
  control,
  fields,
  columns,
  renderFooter = defaultRenderFooter,
  append,
}: TableProps<T, ColumnDef<T>>) {
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
        showFooter
      />
    </>
  );
}

export { AmountColumn, UnitColumn };
