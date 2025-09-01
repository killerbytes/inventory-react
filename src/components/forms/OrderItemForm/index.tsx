import { FieldArrayWithId, UseFormReturn, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { getTotalAmountTableFooter } from "@/lib/utils";
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
  name: string;
  form: UseFormReturn<T>;
  fields: T[];
  columns: TColumns[];
  renderFooter?: (
    data: FooterValuesProps[],
    append: () => void,
  ) => React.ReactNode;
  append?: () => void;
};

function defaultRenderFooter(data: FooterValuesProps[], append: () => void) {
  const total = getTotalAmountTableFooter(data);
  return (
    <>
      {append && (
        <TableRow>
          <TableCell colSpan={8}>
            <Button
              type="button"
              variant="outline"
              className="shadow-sm append-btn"
              onClick={append}
            >
              <Plus />
            </Button>
          </TableCell>
        </TableRow>
      )}
      <TableRow className="font-bold">
        <TableCell colSpan={4}>Total</TableCell>
        <TableCell className="text-right px-5">
          {total?.discount ? formatCurrency(total?.discount) : "-"}
        </TableCell>
        <TableCell></TableCell>
        <TableCell className="text-right px-5 ">
          {formatCurrency(total?.purchasePrice)}
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(total?.amount - total?.discount)}
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderItemForm<T>({
  name,
  fields,
  columns,
  form,
  renderFooter = defaultRenderFooter,
  append,
}: TableProps<T, ColumnDef<T>>) {
  const footerValues = useWatch({ control: form?.control, name });
  return (
    <>
      <DataTable
        data={fields}
        columns={columns}
        errors={form?.formState.errors}
        renderFooter={() => renderFooter(footerValues, append)}
        showFooter
      />
    </>
  );
}

export { AmountColumn, UnitColumn };
