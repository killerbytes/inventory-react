import formatCurrency from "@/utils";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import type { PurchaseOrderItem } from ".";
import useToggle from "@/hooks/useToggle";
import ProductsModal from "./ProductsModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
export default function ProductsTable({
  items = [],
  setItems,
  className,
}: {
  items: PurchaseOrderItem[];
  setItems?: React.Dispatch<React.SetStateAction<PurchaseOrderItem[]>>;
  className?: string;
}) {
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
  });
  const checkboxColumn = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
  const columns: ColumnDef<PurchaseOrderItem>[] = [
    ...(setItems ? ([checkboxColumn] as ColumnDef<PurchaseOrderItem>[]) : []),
    {
      accessorKey: "inventory",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("inventory")?.product?.name}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      cell: ({ row }) => (
        <div className="text-right ">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-right">Unit Price</div>,
      cell: ({ row }) => (
        <div className="text-right ">
          {formatCurrency(row.getValue("unitPrice"))}
        </div>
      ),
    },
  ];
  return (
    <div className={className}>
      {setItems && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mb-2">
          <Button
            onClick={() => handleToggle({ addProductsModal: true })}
            variant="outline"
          >
            <Plus />
            Add a Product
          </Button>
        </div>
      )}

      <DataTable data={items} columns={columns} onUpdate={setItems}>
        <TableFooter>
          <TableRow>
            {setItems && <TableCell></TableCell>}
            <TableCell colSpan={2}>Total Amount</TableCell>
            <TableCell className="text-right">
              {formatCurrency(
                items.reduce(
                  (acc, item) => acc + item.unitPrice * item.quantity,
                  0
                )
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </DataTable>
      {toggle.addProductsModal && (
        <ProductsModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addProductsModal: false });
          }}
          onAdd={(item: PurchaseOrderItem) => {
            setItems((prev) => [...prev, item]);
          }}
          exclude={items.map((item) => item.inventoryId)}
        />
      )}
    </div>
  );
}
