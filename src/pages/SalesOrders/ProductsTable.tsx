import formatCurrency from "@/utils";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import useToggle from "@/hooks/useToggle";
import ProductsModal from "./ProductsModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function ProductsTable<T>({
  items = [],
  setItems,
  className,
  columns,
  footer,
}: {
  items: T[];
  setItems?: React.Dispatch<React.SetStateAction<T[]>>;
  className?: string;
  columns: ColumnDef<T>[];
  footer?: React.ReactNode;
}) {
  console.log(items);
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
  });
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

      <DataTable
        data={items}
        columns={columns}
        onUpdate={setItems}
        emptyText="Please add a product"
      >
        {footer}
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
