import { DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import BarcodeComponent from "./BarcodeComponent";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { ProductCombination } from "@/schemas";
import Modal from "@/components/Modal";
import React from "react";

export default function BarcodePrinter({
  onClose,
  isOpen,
  items,
}: {
  onClose: () => void;
  isOpen: boolean;
  items: ProductCombination[];
}) {
  const contentRef = React.useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
  });

  const columns: ColumnDef<ProductCombination>[] = [
    {
      accessorKey: "name",
      header: "Name",
      meta: {
        headerClassName: "print:hidden",
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "barcode",
      header: "Barcode",
      meta: {
        headerClassName: "text-center print:hidden",
        className: "text-center",
      },
      cell: ({ row }) => (
        <BarcodeComponent
          label={row.original.sku}
          value={String(row.original.barcode)}
        />
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Print Barcode"
      description="Print barcode for the product"
      size="lg"
    >
      <div className="rounded-md border max-h-[80vh] overflow-y-auto ">
        <div ref={contentRef} className="print-container flex flex-col gap-4">
          <DataTable data={items} columns={columns} />
          {/* {items.map((item) => (
            <div className="barcode-item flex">
              <div className="flex items-center gap-2 text-sm">
                <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>
                {item.name}
              </div>
              <div className="ml-auto text-xs font-mono">
                {item.sku}
                <BarcodeComponent className="ml-auto" value={item.barcode} />
              </div>
            </div>
          ))} */}
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handlePrint}>Print Barcode</Button>
      </DialogFooter>
    </Modal>
  );
}
